import request from 'supertest';

import app from '../src/app';

describe('Server', () => {
  it('responds with a not found message', (done) => {
    request(app)
      .get('/non-existing-path')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
  });
  
  it('responds with a json message', (done) => {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        success: true,
        message: 'Athena Server is running!',
      }, done);
  });
});
