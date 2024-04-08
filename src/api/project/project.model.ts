
import { ProjectType, AddMilestoneInput, AddMemberInput, ImportProjectInput } from './project.type';
import { ObjectId } from 'mongodb';
import db from '../../db/mongo.conn';
import fs from 'fs';
import { cleanParams } from '../../helper/common';

const dbProjects = db.collection<ProjectType>('projects');


const getJiraEpicsAsProjects = (params:ImportProjectInput) => {
  const body = fs.readFileSync(__dirname + params.url, 'utf8');
  const data = JSON.parse(body);
    
  let projects:ProjectType[] = [];
  for (let d of data) {
    if (d.fields.issuetype.name === 'Epic') {
      projects.push({
        workspaceId: params.workspaceId,
        name: d.fields.summary,
        description: d.fields.issuetype.description,
        jiraUrl: d.fields.issuetype.self,
        priority: d.fields.priority.name as ProjectType['priority'],
        status: d.fields.status.name,
        milestones: [],
        members: [{
          _id: params.loginId,
          role: 'Owner',
          createdAt: new Date(),
          createdBy: params.loginId,
        }],
        createdAt: new Date(),
        createdBy: params.loginId,
      });
    }
  }
    
  return projects;
};
  
export class Project {
  public static find = dbProjects.find.bind(dbProjects);

  public static findOne = dbProjects.findOne.bind(dbProjects);

  public static hasAccess(peoject: ProjectType, userId: ObjectId) {
    const loginId = userId.toString();
    return peoject.members.find(m => m._id?.toString() === loginId && ['Owner', 'Admin'].includes(m.role));
  }

  public static getMilestone(project: ProjectType, name: string) {
    const milestoneName = new RegExp('^' + name + '$', 'i');
    return project.milestones.find(m => m.name.match(milestoneName));
  }

  public static getMember(project: ProjectType, id: ObjectId) {
    const strId = id.toString();
    return project.members.find(m => m._id?.toString() === strId);
  }

  public static async importFromJira(params: ImportProjectInput): Promise<ProjectType[]> {
    const projects = getJiraEpicsAsProjects(params);    
    await dbProjects.insertMany(projects);

    return projects;
  }

  public static async addMilestone(params: AddMilestoneInput) {
    const projectId = new ObjectId(params.projectId);
    // delete params.projectId;

    const project = await Project.findOne({ 
      _id: projectId, 
      'members._id': params.loginId,
    });
    if (!project) {
      throw new Error('Project not found');
    }

    if (!Project.hasAccess(project, params.loginId)) {
      throw new Error('You do not have right to modify this project');
    }

    if (Project.getMilestone(project, params.name)) {
      throw new Error('Milestone already exists');
    }

    project.milestones.push({
      ...cleanParams(params), 
      createdAt: new Date(), createdBy: new ObjectId(params.loginId),
    });
    
    await dbProjects.updateOne({ _id: projectId }, 
      { $set: { milestones: project.milestones } },
    );
  }

  public static async addMember(params: AddMemberInput) {
    const projectId = new ObjectId(params.projectId);
    // delete params.projectId;

    const project = await Project.findOne({ 
      _id: projectId, 
      'members._id': params.loginId,
    });
    if (!project) {
      throw new Error('Project not found');
    }

    if (!Project.hasAccess(project, params.loginId)) {
      throw new Error('You do not have right to modify this project');
    }
    
    if (Project.getMember(project, params._id)) {
      throw new Error('Member already exists');
    }

    project.members.push({
      ...cleanParams(params), 
      createdAt: new Date(), createdBy: new ObjectId(params.loginId),
    });
    
    await dbProjects.updateOne({ _id: projectId }, 
      { $set: { members: project.members } },
    );
  }
}
