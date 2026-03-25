import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import FavoritesPage from './FavoritesPage'

jest.mock('../components/Navbar', () => () => <div />)
jest.mock('../components/Footer', () => () => <div />)
jest.mock('../utils/usePageTitle', () => ({ usePageTitle: jest.fn() }))
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true })

describe('FavoritesPage', () => {
  test('üres állapot jelenik meg, ha nincs kedvenc', () => {
    render(<FavoritesPage favorites={[]} />)

    expect(screen.getByText('Még nincsenek kedvenc éttermeid')).toBeInTheDocument()
    expect(screen.getByText('Éttermeink böngészése')).toBeInTheDocument()
  })

  test('megjeleníti a kedvenc éttermeket', () => {
    render(
      <FavoritesPage
        favorites={[
          { id: '1', name: 'Pizza Hut', address: 'Miskolc, Fo utca 1', img: '/pizza.jpg' },
          { id: '2', name: 'Burger King', address: 'Miskolc, Szechenyi 2', img: '/burger.jpg' }
        ]}
        pendingFavoriteIds={new Set()}
      />
    )

    expect(screen.getByText('2 kedvenc étterem')).toBeInTheDocument()
    expect(screen.getByText('Pizza Hut')).toBeInTheDocument()
    expect(screen.getByText('Burger King')).toBeInTheDocument()
  })
})
