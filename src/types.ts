export type Bindings = {
  DB: D1Database
}

export type AppEnv = {
  Bindings: Bindings
  Variables: {
    userId: number
  }
}
