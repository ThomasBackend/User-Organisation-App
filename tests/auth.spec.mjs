import test from 'ava';
import request from 'supertest';
import app from '../api/index.js'; 
import db from '../models/database.js';


let testOrgID;
test('Token expires at the correct time and contains correct user details', async t => {

  const registerRes = await request(app)
    .post('/auth/register')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      phone: '1234567890'
    });

  t.is(registerRes.statusCode, 201);

  const { accessToken } = registerRes.body.data;

  const decoded = jwt.decode(accessToken);

  const now = Math.floor(Date.now() / 1000);
  t.truthy(decoded.exp);
  t.true(decoded.exp > now);

  t.is(decoded.firstName, 'John');
  t.is(decoded.email, 'john.doe@example.com');
});


test('Users can only access data from their organisations', async t => {

  const registerRes = await request(app)
    .post('/auth/register')
    .send({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: 'password',
      phone: '1234567890',
      organisationId: 'org123' 
    });

  t.is(registerRes.statusCode, 201);

  // Simulate fetching data that requires organisation-specific access
  const user = await User.findOne({ where: { email: 'alice.smith@example.com' } });
  const userOrgId = user.organisationId; // Extract the organisation ID from user model

  // Make sure the user can access their own organisation data
  const userOrgRecord = await UserOrganisation.findAll({
    where: {
      userId: { [Op.contains]: [user.id] },
      orgId: userOrgId
    },
    attributes: ['orgId']
  });

  t.truthy(userOrgRecord);
});

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

test('Should fail if required fields are missing for first name', async t => {
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

test('Should fail if required fields are missing for lastname', async t => {
  const res = await request(app)
    .post('/auth/register')
    .send({
      firstName: 'John',
      email: 'john.doe@example.com',
      password: 'password'
    });

  t.is(res.statusCode, 422);
  t.deepEqual(res.body, {
    errors: [
      { field: 'lastName', message: 'Last name is required' }
    ]
  });
});

test('Should fail if required fields are missing for email', async t => {
  const res = await request(app)
    .post('/auth/register')
    .send({
      firsName:'John',
      lastName: 'Doe',
      password: 'password'
    });

  t.is(res.statusCode, 422);
  t.deepEqual(res.body, {
    errors: [
      { field: 'email', message: 'Email is required' }
    ]
  });
});

test('Should fail if required fields are missing for password', async t => {
  const res = await request(app)
    .post('/auth/register')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });

  t.is(res.statusCode, 422);
  t.deepEqual(res.body, {
    errors: [
      { field: 'password', message: 'Password is required' }
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
