import { Question } from '../../icons/icons';
import ToolTip from '../ToolTip';

export default function PrependChildInput({ message, id }: { message: string, id: string }) {
  return (
    <>
      <div className='cursor-pointer'>
        <Question id={id} />
      </div>
      <ToolTip title={message} id={id} />
    </>
  );
}
