import type { IBase } from "../interfaces/base.interface"

export abstract class BaseModel {
  id?: string

  createdAt?: Date

  updatedAt?: Date

  constructor(base: IBase) {
    this.id = base.id ? base.id : self.crypto.randomUUID()

    this.createdAt = base.createdAt
    this.updatedAt = base.updatedAt
  }
}