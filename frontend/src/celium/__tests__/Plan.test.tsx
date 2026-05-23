import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Plan from '@/celium/Plan'
import PlanTripDetail from '@/celium/PlanTripDetail'

vi.mock('@/features/api/celiumRoutes', () => ({
  listRoutes: vi.fn(() => Promise.resolve([
    {
      id: 'todo-1',
      name: 'Disappointment Cleaver',
      summary: 'Plan-ready route',
      description: null,
      activityType: 'Hiking',
      climbingStyle: null,
      climbingGrade: null,
      difficulty: 'Moderate',
      distanceMiles: 8,
      elevationGainFt: 2400,
      elevationLossFt: null,
      maxElevationFt: null,
      minElevationFt: null,
      estimatedTimeMinutes: null,
      loopType: 'OutAndBack',
      routeGeometry: '',
      startLatitude: 46.7,
      startLongitude: -121.7,
      endLatitude: 46.8,
      endLongitude: -121.8,
      landscapeTypeId: 'land',
      regionId: 'region',
      status: 'Published',
      progress: 'Todo',
    },
    {
      id: 'completed-1',
      name: 'East Buttress',
      summary: 'Finished route',
      description: null,
      activityType: 'Hiking',
      climbingStyle: null,
      climbingGrade: null,
      difficulty: 'Hard',
      distanceMiles: 6,
      elevationGainFt: 1800,
      elevationLossFt: null,
      maxElevationFt: null,
      minElevationFt: null,
      estimatedTimeMinutes: null,
      loopType: 'OutAndBack',
      routeGeometry: '',
      startLatitude: 36.5,
      startLongitude: -118.2,
      endLatitude: 36.6,
      endLongitude: -118.3,
      landscapeTypeId: 'land',
      regionId: 'region',
      status: 'Published',
      progress: 'Completed',
    },
  ])),
}))

describe('Plan pages', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders plan overview', async () => {
    const now = new Date().toISOString()
    localStorage.setItem('celium:plans:v1', JSON.stringify([
      {
        checklistItems: [
          {
            category: 'Checklist',
            id: 'todo-check-1',
            label: 'Confirm objective timeline',
            status: 'NotStarted',
          },
        ],
        conditions: {
          forecastSummary: '',
          recentObservations: '',
          seasonalContext: '',
        },
        createdAt: now,
        days: [
          {
            activities: [
              {
                dayId: 'day-todo-1',
                id: 'activity-todo-1',
                order: 0,
                routeId: 'todo-1',
                title: 'Disappointment Cleaver',
                type: 'Route',
              },
            ],
            id: 'day-todo-1',
            order: 0,
            title: 'Day 1 - Route objective',
          },
        ],
        id: 'primary-todo-plan',
        metadata: {
          attachedRouteIds: ['todo-1'],
          confidence: 40,
        },
        name: 'Disappointment Cleaver Plan',
        notes: {
          PackingNotes: '',
          RemainingQuestions: '',
          RisksUnknowns: '',
          TripNotes: '',
        },
        status: 'Draft',
        updatedAt: now,
      },
      {
        checklistItems: [],
        conditions: {
          forecastSummary: '',
          recentObservations: '',
          seasonalContext: '',
        },
        createdAt: now,
        days: [],
        id: 'duplicate-todo-plan',
        metadata: {
          attachedRouteIds: ['todo-1'],
          confidence: 40,
        },
        name: 'Duplicate Disappointment Cleaver Plan',
        notes: {
          PackingNotes: '',
          RemainingQuestions: '',
          RisksUnknowns: '',
          TripNotes: '',
        },
        status: 'Draft',
        updatedAt: now,
      },
    ]))

    render(
      <MemoryRouter>
        <Plan />
      </MemoryRouter>
    )

    expect(screen.getByText('Build a trip that stacks the odds in your favor.')).toBeInTheDocument()
    expect((await screen.findAllByText(/(Disappointment Cleaver Plan|Matterhorn Mountaineering Journey)/i)).length).toBeGreaterThan(0)
    expect(await screen.findByRole('button', { name: 'Open planning workspace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'To do (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Completed (1)' })).toBeInTheDocument()
    expect(screen.queryByText('Duplicate Disappointment Cleaver Plan')).not.toBeInTheDocument()
    expect(screen.getByText('Days')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Selected Plan')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Disappointment Cleaver Plan' })).toBeInTheDocument()
    expect(screen.getByAltText('Disappointment Cleaver Plan route preview')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Completed (1)' }))
    expect((await screen.findAllByText('East Buttress Plan')).length).toBeGreaterThan(0)
  })

  it('renders plan trip detail', async () => {
    render(
      <MemoryRouter initialEntries={['/plan/trips/plan-matterhorn-journey']}>
        <Routes>
          <Route path="/plan/trips/:tripId" element={<PlanTripDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Matterhorn Mountaineering Journey')).toBeInTheDocument()
    expect(screen.getByText('Add a route activity to see critical forecast signals.')).toBeInTheDocument()
    expect(screen.getByText('Preparation tasks')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Completed' })).toBeInTheDocument()
    expect(screen.queryByText('Notes and Uncertainty')).not.toBeInTheDocument()
    expect(screen.queryByText('Completion / Reflection')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('New preparation task'), { target: { value: 'Confirm permit pickup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))
    expect(await screen.findByText('Confirm permit pickup')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Confirm permit pickup/i }))
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getAllByText('No description yet.').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Pickup window closes at 5 PM.' } })
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Confirm permit pickup window' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect((await screen.findAllByText('Confirm permit pickup window')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('Pickup window closes at 5 PM.')).length).toBeGreaterThan(0)
  })
})
