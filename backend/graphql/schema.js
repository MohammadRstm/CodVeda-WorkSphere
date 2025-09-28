import { gql } from "graphql-tag";
const typeDefs = gql`#graphql
  scalar Date

  type Department {
    _id: ID!
    name: String
  }

  type Message {
    _id: ID!
    senderId: ID!
    receiverId: ID!
    message: String!
    sentAt: Date!
  }

  type Profile {
    bio: String
    photo_url: String
  }

  type User {
    _id: ID!
    name: String!
    username: String!
    age: Int
    role: String
    password: String
    dep_id: Department
    project_id: Project
    profile: Profile
    tasks: [Task]
    created_at : Date!
  }

  input UserInput {
    name: String!
    username: String!
    age: Int
    password: String!
    department: String!
  }

  type ProjectWithManager {
  _id: ID!
  name: String!
  dep_id: Department
  managerName: String
  managerId: ID
  start_date: Date
  deadline: Date
}


  type AuthPayload {
    token: String!
    user: User!
  }

  type Task {
    _id: ID
    name: String!
    description: String
    state: String!
    days_to_finish: Int!
    username: String
  }

  input TaskInput {
    name: String!
    description: String
    username: String!
    project: ID!
    days_to_finish: String!
  }

  input TaskSubmitInput {
    name: String
    description: String
    state: String
    start_date: Date
    deadline: Date
  }

  type Project {
    _id: ID!
    name: String!
    dep_id: Department
    start_date: Date
    deadline: Date
  }

  type ProjectDetails {
    id: ID!
    projectName: String!
    depName: String!
    dep_id: ID
    start_date: Date
    deadline: Date
    managerName: String
    managerId: ID
    tasks: [Task]
  }

  input ProjectInput {
    name: String!
    deadline: Date
    department: ID!
    manager: ID!
  }

  input ProjectUpdateInput {
    id: ID!
    newName: String!
    newManager: ID
    oldManager: ID
  }

  type Query {
    # Departments
    allDepartments: [Department]

    # Users
    allUsers: [User]
    userById(id: ID!): User
    allEmployees: [User]
    allManagers: [User]

    # Profile
    getUserProfile(id: ID!): User

    # Tasks
    allTasks(userId: ID!): [Task]

    # Messages
    allMessages(senderId: ID!, receiverId: ID!): [Message!]!

    # Projects
    allProjects: [ProjectWithManager]
    projectDetails(id: ID!): ProjectDetails

    projectProgress(projectId: ID!): Float
  }

  scalar Upload
  type Mutation {
    # Users
    register(input: UserInput!): User
    login(username: String!, password: String!): AuthPayload
    promoteUser(id: ID!): User
    demoteUser(id: ID!): User
    deleteUser(id: ID!): User

    # Profile
    updateUserProfile(id: ID!, name: String, age: Int, bio: String): User
    updateUserPhoto(id: ID!, photo: Upload!): User


    # Tasks
    addTask(tasks: [TaskInput!]!): [Task]
    updateTask(userId: ID!, taskId: ID!): Task
    deleteTask(userId: ID!, taskId: ID!): [Task]

    # Messages
    sendMessage(senderId: ID!, receiverId: ID!, message: String!): Message

    # Projects
    addProject(formData: ProjectInput!): Project
    updateProject(id: ID!, newName: String!, newManager: ID, oldManager: ID , newDeadline: String): Project
    deleteProject(id: ID!): Project
    projectProgress(projectId: ID!): Float
    submitProject(manager: ID!, projectId: ID!): User

  }
`;

export default typeDefs;
