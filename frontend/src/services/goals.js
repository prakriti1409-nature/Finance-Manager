import api from '../api/axios';

export async function getGoals() {
  const res = await api.get("goals/");
  return res.data;
}

export async function addGoal(goalData) {
  const res = await api.post("goals/", goalData);
  return res.data;
}

export async function deleteGoal(id) {
  const res = await api.delete(`goals/${id}/`);
  return res.data;
}
