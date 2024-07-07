import test from 'ava';
import request from 'supertest';
import app from '../api/index.js'; 
import db from '../models/database.js';

test('Should register user successfully with default organisation', async t => {
  const res = await request(app)
    .post('/auth/register')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      phone: '1234567890'
    });

  t.is(res.statusCode, 201);
  t.is(res.body.status, 'success');
  t.is(res.body.data.user.firstName, 'John');
  t.is(res.body.data.user.email, 'john.doe@example.com');
  t.truthy(res.body.data.accessToken);
});

test('Should fail if required fields are missing', async t => {
  const res = await request(app)
    .post('/auth/register')
    .send({
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password'
    });

  t.is(res.statusCode, 422);
  t.deepEqual(res.body, {
    errors: [
      { field: 'firstName', message: 'First name is required' }
    ]
  });
});

test('Should fail if there is a duplicate email', async t => {
  await request(app)
    .post('/auth/register')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      phone: '1234567890'
    });

  const res = await request(app)
    .post('/auth/register')
    .send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      phone: '0987654321'
    });

  t.is(res.statusCode, 400);
});

test('Should log the user in successfully', async t => {
  await request(app)
    .post('/auth/register')
    .send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password1',
      phone: '0987654321'
    });

  const res = await request(app)
    .post('/auth/login')
    .send({
      email: 'jane.doe@example.com',
      password: 'password'
    });

  t.is(res.statusCode, 200);
  t.is(res.body.status, 'success');
  t.is(res.body.data.user.email, 'jane.doe@example.com');
  t.truthy(res.body.data.accessToken);
});

test('Should fail if login credentials are incorrect', async t => {
  const res = await request(app)
    .post('/auth/login')
    .send({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });

  t.is(res.statusCode, 401);
});
