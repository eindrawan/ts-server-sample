import request from 'supertest';
import app from '../src/app';
import db, { connectDB, closeDB } from '../src/db/mongo.conn';
import { ObjectId } from 'mongodb';
  
let token = '';
let companyId = '';
let workspaceId = '';
let projectId = '';
beforeAll(async () => {  
  await connectDB();
}, 20000);

afterAll(async () => {
  // clean up data
  await db.collection('users').deleteOne({ email: 'basicflow@test.com' });
  await db.collection('companies').deleteOne({ name: 'BasicFlow Test Company' });
  await db.collection('projects').deleteMany({ workspaceId: new ObjectId(workspaceId) });

  await closeDB();
});

describe('Basic Flow', () => {
  it('successfully signup', (done) => {
    request(app)
      .post('/api/v1/users/signup')
      .send({
        'name': 'Basic Flow Test User',
        'email': 'basicflow@test.com',
        'password': 'correctpass',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        success: true,
        message: 'User signed up successfully',
      }, done);
  });
  
  it('successfully logged in', (done) => {
    request(app)
      .post('/api/v1/users/login')
      .send({
        'email': 'basicflow@test.com',
        'password': 'correctpass',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: [{ token: expect.any(String) }],
            message: 'Login successfully',
          }),
        );

        token = response.body.data[0].token;

        done();
      });
  });

  it('successfully create a company', (done) => {
    request(app)
      .put('/api/v1/companies')
      .send({
        'name': 'BasicFlow Test Company',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: [{ _id: expect.any(String) }],
            message: 'Company created successfully',
          }),
        );

        companyId = response.body.data[0]._id;

        done();
      });
  });

  it('successfully add workspace', (done) => {
    request(app)
      .put('/api/v1/companies/workspaces')
      .send({
        'companyId': companyId,
        'name': 'BasicFlow Workspace 1',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: [{ _id: expect.any(String) }],
            message: 'Workspace added successfully',
          }),
        );

        workspaceId = response.body.data[0]._id;

        done();
      });
  });

  it('successfully import projects from jira', (done) => {
    request(app)
      .post('/api/v1/projects/import-jira')
      .send({
        'workspaceId': workspaceId,
        'url': '/jira.sample.json',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.any(Array),
            message: 'Projects imported successfully',
          }),
        );

        projectId = response.body.data[0]._id;

        done();
      });
  });

  it('successfully add milestone to project', (done) => {
    request(app)
      .put('/api/v1/projects/milestones')
      .send({
        'projectId': projectId,
        'name': 'Milestone 1',
        'status': 'On Track',
        'startDate': '2024-01-01',
        'endDate': '2024-02-01',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        success: true,
        message: 'Milestone added successfully',
      }, done);
  });
});