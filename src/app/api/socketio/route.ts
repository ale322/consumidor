import { Server } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'
import { setupSocket } from '@/lib/socket'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server as any, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    })
    
    setupSocket(io)
    res.socket.server.io = io
  }
  
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}