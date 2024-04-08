import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';
import { connectDB, closeDB } from '../../db/mongo.conn';
  
let token = '';
const workspaceId = '6611818d9217e6959f7549ba';
const userId = '6611818c9217e6959f7549b6';
beforeAll(async () => {
  token = jwt.sign({ 
    userId: userId, 
    companyId: '6611818d9217e6959f7549b8' }, 
  process.env.SECRET || '');

  await connectDB();
}, 20000);

afterAll(async () => {
  // clean up data
  await closeDB();
});

describe('Search Project', () => {
  it('prevent search without login', (done) => {
    request(app)
      .get('/api/v1/projects')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500, {
        success: false,
        message: 'Unauthorized',
        stack: '-',
      }, done);
  });
  
  it('can search project using workspaceId', (done) => {
    request(app)
      .get(`/api/v1/projects?workspaceId=${workspaceId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.any(Array),
          }),
        );

        expect(response.body.data.length).toBeGreaterThan(0);

        done();
      });
  });

  it('can search project using userId', (done) => {
    request(app)
      .get(`/api/v1/projects?userId=${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.any(Array),
          }),
        );

        expect(response.body.data.length).toBeGreaterThan(0);

        done();
      });
  });

  it('can search project using workspaceId and userId', (done) => {
    request(app)
      .get(`/api/v1/projects?workspaceId=${workspaceId}&userId=${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.any(Array),
          }),
        );

        expect(response.body.data.length).toBeGreaterThan(0);

        done();
      });
  });
});
