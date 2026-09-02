import { Route, Router as WouterRouter, Switch } from 'wouter';
import { StoreProvider } from './context/StoreContext';
import { NotFound, ProtectedRoute, RoleEntry } from './pages/RoleSelection';
import { AshaDashboard } from './pages/AshaDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './index.css';

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={RoleEntry} />
      <Route path="/doctor-dashboard">
        {() => (
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/asha-dashboard">
        {() => (
          <ProtectedRoute requiredRole="asha">
            <AshaDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin-dashboard">
        {() => (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route>
        {() => <NotFound />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <StoreProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AppRouter />
      </WouterRouter>
    </StoreProvider>
  );
}

export default App;