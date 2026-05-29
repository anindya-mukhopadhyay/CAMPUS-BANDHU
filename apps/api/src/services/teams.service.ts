import TeamModel from "../models/team.model";
import UserModel from "../models/user.model";

export async function getAllTeams() {
  const teams = await TeamModel.find().sort({ createdAt: -1 }).lean();
  
  // Extract all unique uids from members and pendingRequests
  const uids = new Set<string>();
  teams.forEach(t => {
    t.members.forEach(m => uids.add(m));
    t.pendingRequests.forEach(p => uids.add(p));
  });

  const users = await UserModel.find(
    { uid: { $in: Array.from(uids) } },
    "uid fullName gender avatarUrl bio department"
  ).lean();

  const userMap = new Map(users.map(u => [u.uid, u]));

  return teams.map(t => ({
    ...t,
    id: (t as any)._id.toString(),
    membersPopulated: t.members.map(m => userMap.get(m) || { uid: m, fullName: "Unknown User", gender: "Undeclared" }),
    pendingRequestsPopulated: t.pendingRequests.map(p => userMap.get(p) || { uid: p, fullName: "Unknown User", gender: "Undeclared" })
  }));
}

export async function createTeam(
  creatorId: string,
  creatorName: string,
  payload: {
    name: string;
    event: string;
    skills?: string[];
    need?: string[];
    boysCriteria?: number;
    girlsCriteria?: number;
  }
) {
  const boysCriteria = Number(payload.boysCriteria) || 0;
  const girlsCriteria = Number(payload.girlsCriteria) || 0;
  const membersNeeded = boysCriteria + girlsCriteria;

  const team = await TeamModel.create({
    name: payload.name,
    event: payload.event,
    creatorId,
    creatorName,
    skills: payload.skills || [],
    need: payload.need || [],
    boysCriteria,
    girlsCriteria,
    membersNeeded,
    members: [creatorId], // Creator is automatically a member
    pendingRequests: []
  });

  return team;
}

export async function requestToJoin(teamId: string, userId: string) {
  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  if (team.members.includes(userId)) {
    throw new Error("You are already a member of this team");
  }

  if (team.pendingRequests.includes(userId)) {
    throw new Error("Your join request is already pending");
  }

  team.pendingRequests.push(userId);
  await team.save();
  return team;
}

export async function acceptJoinRequest(teamId: string, creatorId: string, requesterId: string) {
  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  if (team.creatorId !== creatorId) {
    throw new Error("Unauthorized: Only the team admin can accept requests");
  }

  if (!team.pendingRequests.includes(requesterId)) {
    throw new Error("Request not found in pending queue");
  }

  // Remove from pending
  team.pendingRequests = team.pendingRequests.filter(uid => uid !== requesterId);

  // Add to members if not already
  if (!team.members.includes(requesterId)) {
    team.members.push(requesterId);
    // Decrement slots needed
    team.membersNeeded = Math.max(0, team.membersNeeded - 1);
  }

  await team.save();
  return team;
}

export async function rejectJoinRequest(teamId: string, creatorId: string, requesterId: string) {
  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  if (team.creatorId !== creatorId) {
    throw new Error("Unauthorized: Only the team admin can reject requests");
  }

  // Remove from pending
  team.pendingRequests = team.pendingRequests.filter(uid => uid !== requesterId);

  await team.save();
  return team;
}
