import { LocalChart } from "../Components/Charts/Chart";
import { ChartDisplay } from "../Components/Charts/ChartDisplay";

const chartConfigs = [
  {
    type: "bar",
    className: "p-2 border-2 rounded-lg",
    title: "Alerts by Country",
    containerClass: "rounded-lg"
  },
  {
    type: "pie",
    className: "p-2 border-2 rounded-lg",
    title: "Alert Distribution",
    containerClass: "rounded-lg"
  },
  // Add more chart configurations as needed
];

const ChartContainer = ({ children, title, className }) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {title && <h2 className="text-lg font-semibold p-2">{title}</h2>}
      <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for flex child to respect parent height */}
        {children}
      </div>
    </div>
  );
};

const DetailsPage = () => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 p-4 w-screen h-screen">
      {chartConfigs.map((config, index) => (
        <ChartContainer
          key={index}
          title={config.title}
          className={config.containerClass}
        >
          <LocalChart
            className={config.className}
            type={config.type}
          >
            <ChartDisplay type={config.type} />
          </LocalChart>
        </ChartContainer>
      ))}
    </div>
  );
};

export default DetailsPage;
