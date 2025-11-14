export interface Alert {
  message: string;
  type: AlertType;
}

export enum AlertType {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}
