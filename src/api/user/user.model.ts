
import { AddUserInput, LoginUserInput, UserType } from './user.type';
import db from '../../db/mongo.conn';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { cleanParams } from '../../helper/common';

const dbUsers = db.collection<UserType>('users');

export class User {
  public static find = dbUsers.find.bind(dbUsers);
  
  public static findOne = dbUsers.findOne.bind(dbUsers);

  public static async signup(params: AddUserInput) {
    const password = await bcrypt.hash(params.password, 8);
    await dbUsers.insertOne({ ...cleanParams(params), password, createdAt: new Date() });
  }

  public static async login(params: LoginUserInput) {    
    const found = await dbUsers.findOne({ email: params.email });

    if (!found) {
      throw new Error('User or Password is incorrect');
    }    
    if (!bcrypt.compareSync(params.password, found.password)) {
      throw new Error('User or Password is incorrect');
    } 
    const token = jwt.sign({ userId: found._id, companyId: found.companyId }, process.env.SECRET || '');

    return { token };
  }

  public static async joinCompany(userId: ObjectId, companyId: ObjectId) {
    await dbUsers.updateOne({ _id: userId }, 
      { $set: { companyId: companyId } },
    );
  }
}