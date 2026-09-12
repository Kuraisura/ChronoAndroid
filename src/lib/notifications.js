import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

function notificationId(taskId) {
  let hash = 0;
  for (const char of taskId) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash) || 1;
}

export async function scheduleTaskNotification(task) {
  if (!Capacitor.isNativePlatform()) return;
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return;

  const [hours, minutes] = (task.start_time || task.time || '00:00').split(':').map(Number);
  const schedule = task.date
    ? { at: new Date(`${task.date}T${task.start_time || task.time}:00`), allowWhileIdle: true }
    : { on: { hour: hours, minute: minutes }, repeats: true, allowWhileIdle: true };

  if (schedule.at && schedule.at <= new Date()) return;
  await LocalNotifications.cancel({ notifications: [{ id: notificationId(task.id) }] });
  await LocalNotifications.schedule({
    notifications: [{
      id: notificationId(task.id),
      title: task.title || task.task,
      body: task.description || task.tip || 'Scheduled task is due.',
      schedule,
      sound: 'default',
      extra: { taskId: task.id },
    }],
  });
}

export async function cancelTaskNotification(taskId) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: notificationId(taskId) }] });
}
