import { requireSupabase, supabase } from './supabaseClient';

const id = () => crypto.randomUUID();

async function currentUser() {
  const { user } = (await requireSupabase().auth.getUser()).data;
  if (!user) throw new Error('You must be signed in.');
  return user;
}

function mapTask(row) {
  return {
    ...row,
    title: row.task,
    description: row.tip || '',
    start_time: row.time,
    duration_hours: row.duration_hours ?? 1,
    status: row.status || 'QUEUED',
  };
}

function taskRow(value, userId) {
  return {
    id: value.id || id(),
    user_id: userId,
    task: value.title ?? value.task ?? 'Untitled Task',
    tip: value.description ?? value.tip ?? '',
    date: value.date || '',
    time: value.start_time ?? value.time ?? '00:00',
    duration_hours: Number(value.duration_hours) || 1,
    status: value.status || 'QUEUED',
    updated_at: new Date().toISOString(),
  };
}

const Task = {
  async list() {
    const { data, error } = await requireSupabase().from('tasks').select('*').order('date').order('time');
    if (error) throw error;
    return (data || []).map(mapTask);
  },
  async get(taskId) {
    const { data, error } = await requireSupabase().from('tasks').select('*').eq('id', taskId).single();
    if (error) throw error;
    return mapTask(data);
  },
  async create(value) {
    const user = await currentUser();
    const { data, error } = await requireSupabase().from('tasks').insert(taskRow(value, user.id)).select().single();
    if (error) throw error;
    return mapTask(data);
  },
  async update(taskId, value) {
    await currentUser();
    const row = { updated_at: new Date().toISOString() };
    if ('title' in value || 'task' in value) row.task = value.title ?? value.task;
    if ('description' in value || 'tip' in value) row.tip = value.description ?? value.tip;
    if ('date' in value) row.date = value.date || '';
    if ('start_time' in value || 'time' in value) row.time = value.start_time ?? value.time;
    if ('duration_hours' in value) row.duration_hours = Number(value.duration_hours) || 1;
    if ('status' in value) row.status = value.status;
    const { data, error } = await requireSupabase().from('tasks').update(row).eq('id', taskId).select().single();
    if (error) throw error;
    return mapTask(data);
  },
  async delete(taskId) {
    const { error } = await requireSupabase().from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },
};

function entity(table) {
  return {
    async list() {
      const { data, error } = await requireSupabase().from(table).select('*').order('created_at');
      if (error) throw error;
      return data || [];
    },
    async get(entityId) {
      const { data, error } = await requireSupabase().from(table).select('*').eq('id', entityId).single();
      if (error) throw error;
      return data;
    },
    async create(value) {
      const user = await currentUser();
      const { data, error } = await requireSupabase().from(table).insert({ ...value, id: value.id || id(), user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    async update(entityId, value) {
      const { data, error } = await requireSupabase().from(table).update({ ...value, updated_at: new Date().toISOString() }).eq('id', entityId).select().single();
      if (error) throw error;
      return data;
    },
    async delete(entityId) {
      const { error } = await requireSupabase().from(table).delete().eq('id', entityId);
      if (error) throw error;
    },
  };
}

export const backend = {
  auth: {
    async me() {
      const user = await currentUser();
      return { ...user, role: user.user_metadata?.role || 'user' };
    },
    async isAuthenticated() {
      return Boolean((await requireSupabase().auth.getSession()).data.session);
    },
    async loginViaEmailPassword(email, password) {
      const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async register({ email, password }) {
      const { data, error } = await requireSupabase().auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    async verifyOtp({ email, otpCode }) {
      const { data, error } = await requireSupabase().auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw error;
      return data.session;
    },
    async resendOtp(email) {
      const { data, error } = await requireSupabase().auth.resend({ type: 'signup', email });
      if (error) throw error;
      return data;
    },
    async resetPasswordRequest(email) {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { data, error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return data;
    },
    async resetPassword({ newPassword }) {
      const { data, error } = await requireSupabase().auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    },
    async logout() {
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
    },
    onAuthStateChange(callback) {
      return supabase?.auth.onAuthStateChange(callback).data.subscription;
    },
  },
  entities: {
    Task,
    Category: entity('categories'),
    JournalEntry: entity('journal_entries'),
  },
  storage: {
    async uploadJournalPhoto(entryId, file) {
      const user = await currentUser();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${user.id}/${entryId}/${id()}-${safeName}`;
      const { error } = await requireSupabase().storage.from('journal-photos').upload(path, file);
      if (error) throw error;
      return requireSupabase().storage.from('journal-photos').getPublicUrl(path).data.publicUrl;
    },
  },
};

export default backend;
