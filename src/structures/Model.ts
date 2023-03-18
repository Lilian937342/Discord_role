import {ModelAttributes, ModelOptions} from 'sequelize'
type modelOptions = {name: string, schema: ModelAttributes, options: ModelOptions}

export default class ModelCreate{
  schema: ModelAttributes
  name: string
  options: ModelOptions
  constructor(model: modelOptions) {
    Object.assign(this, model)
  }
}