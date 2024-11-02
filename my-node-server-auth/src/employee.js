import Router from 'koa-router';
import dataStore from 'nedb-promise';
import { broadcast } from './wss.js';

export class EmployeeStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }

  async find(props) {
    return this.store.find(props);
  }

  // async size(props){
  //   return this.store.size;
  // }

  async findOne(props) {
    return this.store.findOne(props);
  }

  async insert(employee) {
    if (!employee.firstName) { // validation
      throw new Error('Missing text property')
    }
    return this.store.insert(employee);
  };

  async update(props, employee) {
    return this.store.update(props, employee);
  }

  async remove(props) {
    return this.store.remove(props);
  }
}

const employeeStore = new EmployeeStore({filename: './db/employees.json',autoload:true})

export const employeeRouter = new Router()

employeeRouter.get('/', async(ctx)=>{
  const userId = ctx.state.user._id
  console.log("userID: " + userId)
  ctx.response.body = await (employeeStore.find({userId}))
  console.log(ctx.response.body)
  ctx.response.status = 200; // ok
})

employeeRouter.get('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const employee = await employeeStore.findOne({ _id: ctx.params.id });
    const response = ctx.response;
    if (employee) {
      if (employee.userId === userId) {
        ctx.response.body = employee;
        ctx.response.status = 200; // ok
      } else {
        ctx.response.status = 403; // forbidden
      }
    } else {
      ctx.response.status = 404; // not found
    }
});

const createEmployee = async (ctx, employee, response) => {
    try {
      const userId = ctx.state.user._id;
      employee.userId = userId;
      response.body = await employeeStore.insert(employee);
      response.status = 201; // created
      broadcast(userId, { type: 'created', payload: employee });
    } catch (err) {
      response.body = { message: err.message };
      response.status = 400; // bad request
    }
  };

  employeeRouter.post('/', async ctx => await createEmployee(ctx, ctx.request.body, ctx.response));


  employeeRouter.put('/:id', async ctx => {
    const employee = ctx.request.body;
    const id = ctx.params.id;
    const employeeId = employee._id;
    const response = ctx.response;
    if (employeeId && employeeId !== id) {
      response.body = { message: 'Param id and body _id should be the same' };
      response.status = 400; // bad request
      return;
    }
    if (!employeeId) {
      await createEmployee(ctx, employee, response);
    } else {
      const userId = ctx.state.user._id;
      employee.userId = userId;
      const updatedCount = await employeeStore.update({ _id: id }, employee);
      if (updatedCount === 1) {
        response.body = employee;
        response.status = 200; // ok
        broadcast(userId, { type: 'updated', payload: employee });
      } else {
        response.body = { message: 'Resource no longer exists' };
        response.status = 405; // method not allowed
      }
    }
  });
  
  employeeRouter.del('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const employee = await employeeStore.findOne({ _id: ctx.params.id });
    if (employee && userId !== employee.userId) {
      ctx.response.status = 403; // forbidden
    } else {
      await employeeStore.remove({ _id: ctx.params.id });
      ctx.response.status = 204; // no content
    }
  });

  