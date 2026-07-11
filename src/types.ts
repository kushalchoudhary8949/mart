export type Bindings = {
  DB: D1Database
  DEV_MODE?: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: {
    userId: number
  }
}
