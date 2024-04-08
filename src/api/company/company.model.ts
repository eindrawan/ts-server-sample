
import { AddEmployeeInput, AddWorkspaceInput, CompanyType, CreateCompanyInput, WorkspaceType } from './company.type';
import db from '../../db/mongo.conn';
import { ObjectId } from 'mongodb';
import { cleanParams } from '../../helper/common';

const dbCompanies = db.collection<CompanyType>('companies');

export class Company {
  public static find = dbCompanies.find.bind(dbCompanies);
  
  public static findOne = dbCompanies.findOne.bind(dbCompanies);

  public static async create(params: CreateCompanyInput) {
    if (await Company.getByUser(params.loginId)) {
      throw new Error('User already registered in another company');
    }

    const ret = await dbCompanies.insertOne({ 
      name: params.name,
      employees: [{
        _id: new ObjectId(params.loginId),
        role: 'Owner',
        createdAt: new Date(),
        createdBy: new ObjectId(params.loginId),
      }],
      workspaces: [],
      createdAt: new Date(),
      createdBy: new ObjectId(params.loginId),
    });

    return ret.insertedId;
  }

  public static async getByUser(id: ObjectId) {
    return dbCompanies.findOne({
      'employees._id': id,
    });
  }

  public static getEmployee(company: CompanyType, id: ObjectId) {
    const strId = id.toString();
    return company.employees.find(m => m._id?.toString() === strId);
  }

  public static getWorkspace(company: CompanyType, nameOrId: string | ObjectId): WorkspaceType | undefined {
    if (typeof nameOrId == 'string') {
      const rx = new RegExp(nameOrId, 'i');
      return company.workspaces.find(m => m.name.match(rx));
    } else {
      return company.workspaces.find(m => m._id?.toString() === nameOrId.toString());
    }
  }

  public static async addWorkspace(params: AddWorkspaceInput, company?:CompanyType | null) {
    if (!company) {
      company = await dbCompanies.findOne({ _id: params.companyId });
      if (!company) {
        throw new Error('Company not found');
      }
    }

    const emp = Company.getEmployee(company, params.loginId);
    if (!emp || !['Owner', 'Admin'].includes(emp.role))
      throw new Error('You do not have right to modify this company');

    if (company.workspaces.length >= 2) 
      throw new Error('Workspace already reach maximum capacity');

    if (Company.getWorkspace(company, params.name))
      throw new Error('Workspace already exists');

    const workspaceId = new ObjectId();
    company.workspaces.push({
      _id: workspaceId,
      ...cleanParams(params), projects:[],
      createdAt: new Date(), createdBy: new ObjectId(params.loginId),
    });
    
    await dbCompanies.updateOne({ _id: company._id }, 
      { $set: { workspaces: company.workspaces } },
    );

    return workspaceId;
  }

  public static async joinEmployee(params: AddEmployeeInput, company?:CompanyType | null) {
    if (!company) {
      company = await dbCompanies.findOne({ companyId: params.companyId });
      if (!company) {
        throw new Error('Company not found');
      }
    }

    if (Company.getEmployee(company, params._id)) return;

    company.employees.push({
      ...cleanParams(params), 
      createdAt: new Date(), createdBy: new ObjectId(params.loginId),
    });
    
    await dbCompanies.updateOne({ _id: company._id }, 
      { $set: { employees: company.employees } },
    );
  }  
}

export class Workspace {
  public static async includeProjects(workspaceId: ObjectId, projectIds: Record<string, ObjectId>[]) {
    const company = await dbCompanies.findOne({ 'workspaces._id': workspaceId });
    if (!company) {
      throw new Error('Workspace not found');
    }
    const workspace = Company.getWorkspace(company, workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    workspace.projects.push(...projectIds.map(p => p._id));

    await dbCompanies.updateOne({ _id: company._id }, 
      { $set: { workspaces: company.workspaces } },
    );
  }
}