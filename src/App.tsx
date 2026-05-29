import { useProjectStore } from './store/projectStore';
import MeasuringScreen from './components/measuring/MeasuringScreen';
import ConfigScreen from './components/configuration/ConfigScreen';
import ProposalScreen from './components/proposal/ProposalScreen';
import ProjectsScreen from './components/proposal/ProjectsScreen';

export default function App() {
  const phase = useProjectStore((s) => s.phase);

  switch (phase) {
    case 'measuring':     return <MeasuringScreen />;
    case 'configuration': return <ConfigScreen />;
    case 'proposal':      return <ProposalScreen />;
    case 'projects':      return <ProjectsScreen />;
    default:              return <MeasuringScreen />;
  }
}
