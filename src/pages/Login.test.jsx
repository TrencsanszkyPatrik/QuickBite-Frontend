import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import Login from './Login'
import { showToast } from '../utils/toast'

jest.mock('axios')
jest.mock('../utils/api', () => ({ API_BASE: 'http://test.local/api' }))
jest.mock('../components/Navbar', () => () => <div />)
jest.mock('../components/Footer', () => () => <div />)
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true })
jest.mock('../utils/toast', () => ({
  showToast: { success: jest.fn(), error: jest.fn() }
}))

const fillAndSubmit = async (email, password) => {
  await userEvent.type(screen.getByLabelText('Email:'), email)
  await userEvent.type(screen.getByLabelText('Jelszó:'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Bejelentkezés!' }))
}

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('helyes adatokkal sikeres bejelentkezés', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'mock-token', userId: 1, name: 'Teszt Elek' }
    })

    render(<Login />)
    await fillAndSubmit('teszt@pelda.hu', 'Jelszo123!')

    await waitFor(() => expect(showToast.success).toHaveBeenCalledWith('Sikeres bejelentkezés!'))
  })

  test('helytelen adatoknál hibaüzenet jelenik meg', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Hibás email vagy jelszó' } }
    })

    render(<Login />)
    await fillAndSubmit('rossz@pelda.hu', 'rosszjelszo')

    await waitFor(() => expect(showToast.error).toHaveBeenCalledWith('Hibás email vagy jelszó'))
  })
})