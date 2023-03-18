type taskOptions= {
  execute: Function,
  time: number
}

export default class Task{
  constructor(taskOption: taskOptions) {
    Object.assign(this, taskOption)
  }
}