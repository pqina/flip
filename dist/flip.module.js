import Tick from '../tick/tick.core.module';
import Flip from './tick.view.flip.module';

if (Tick && Tick.plugin) Tick.plugin.add(Flip);
export default Tick;
