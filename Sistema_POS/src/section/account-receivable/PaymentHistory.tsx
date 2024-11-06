import { StepsProps } from '../../types/types';

interface PaymentHistoryProps {
  steps: StepsProps[];
  onClick?: (step: StepsProps) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ steps, onClick }) => (
  <ol className="relative border-s border-gray-200">
    {steps.map((step, index) => (
      <li onClick={() => onClick(step)} role='button' key={index} className={`${index !== steps.length - 1 && 'mb-5'} ms-4`}>
        <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -start-1.5 border border-white"></div>
        <div className='flex items-center justify-between'>
          <time className="mb-1 text-sm font-medium leading-none text-whiting">{step.date.toLocaleDateString()}</time>
          <span className='text-sm text-primary font-semibold'>C$ {step.description}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
      </li>

    ))}
  </ol>
);

export default PaymentHistory;
