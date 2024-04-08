import request from 'supertest';
import app from '../../app';
import db, { connectDB, closeDB } from '../../db/mongo.conn';
  
beforeAll(async () => {
  await connectDB();
}, 20000);

afterAll(async () => {
  // clean up data
  await db.collection('users').deleteOne({ email: 'unit@test.com' });
  await closeDB();
});

describe('Signup User', () => {
  it('successfully signup', (done) => {
    request(app)
      .post('/api/v1/users/signup')
      .send({
        'name': 'UnitTest  User',
        'email': 'unit@test.com',
        'password': 'correctpass',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        success: true,
        message: 'User signed up successfully',
      }, done);
  });
  
  it('rejects when signup with already exists email', (done) => {
    request(app)
      .post('/api/v1/users/signup')
      .send({
        'name': 'UnitTest  User',
        'email': 'unit@test.com',
        'password': 'correctpass',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500, {
        success: false,
        message: 'Duplicate data { email: "unit@test.com" }',
        stack: '-',
      }, done);
  });
});

describe('Login User', () => {
  it('rejects on wrong username', (done) => {
    request(app)
      .post('/api/v1/users/login')
      .send({
        'email': 'unit@test.wrong',
        'password': 'correctpass',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500, {
        success: false,
        message: 'User or Password is incorrect',
        stack: '-',
      }, done);
  });

  it('rejects on wrong password', (done) => {
    request(app)
      .post('/api/v1/users/login')
      .send({
        'email': 'unit@test.com',
        'password': 'wrongpass',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500, {
        success: false,
        message: 'User or Password is incorrect',
        stack: '-',
      }, done);
  });

  it('successfully logged in', (done) => {
    request(app)
      .post('/api/v1/users/login')
      .send({
        'email': 'unit@test.com',
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
        done();
      });
  });
});