import { Request, Response, NextFunction } from 'express'
import { supabase } from '../../utils/supabase'
import { User } from '@supabase/auth-js'

export interface AuthenticatedRequest extends Request {
  supabaseUser?: User
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

  req.supabaseUser = data.user
  next()
}