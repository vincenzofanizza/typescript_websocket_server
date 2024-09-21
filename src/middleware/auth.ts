import { Request, Response, NextFunction } from 'express'
import supabase from '../auth/supabaseClient'

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = data.user
  next()
}