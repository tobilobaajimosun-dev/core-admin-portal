import { Routes } from '@angular/router';

export const PUSH_NOTIFICATIONS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./push-notifications.component').then(
                (m) => m.PushNotificationsComponent
            ),
    },
];