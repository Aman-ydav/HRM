import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../lib/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is already logged in on mount
  useEffect(() => {
    const restoreToken = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        try {
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { token, user: JSON.parse(user) },
          })
        } catch (err) {
          console.error('Failed to restore token:', err)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    restoreToken()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await authService.login({ email, password })
      const { user, token } = response

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      })

      return { success: true }
    } catch (error) {
      const errorMsg = error.message || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      return { success: false, error: errorMsg }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await authService.register(userData)
      const { user, token } = response

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      })

      return { success: true }
    } catch (error) {
      const errorMsg = error.message || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      return { success: false, error: errorMsg }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    isAuthenticated: !!state.token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
