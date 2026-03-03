import { cn } from "@/core/lib/utils";


/**
 * HomePage Props
 * Game implementations can provide their own logo, version, and demo data handlers
 */
interface HomePageProps {
  // logo?: string;
  appName?: string;
  // version?: string;
  // onLoadDemoData?: () => Promise<void>;
  // onLoadDemoScheduleOnly?: () => Promise<void>;
  // onClearData?: () => Promise<void>;
  // checkExistingData?: () => Promise<boolean>;
  // demoDataDescription?: string;
  // demoDataStats?: string;
  // demoScheduleStats?: string;
}


const HomePage = ({
  // logo,
  appName = "Scout 2026 Rebuilt",
  // version = "2026.0.9",
  // onLoadDemoData,
  // onLoadDemoScheduleOnly,
  // onClearData,
  // checkExistingData,
  // demoDataDescription = "Load sample scouting data to explore the app's features",
  // demoDataStats = "Demo data loaded successfully!",
  // demoScheduleStats = "Demo schedule loaded successfully!"

}: HomePageProps = {}) => {
  // const [isLoading, setIsLoading] = useState(false);
  // const [isLoaded, setIsLoaded] = useState(false);
  // const [loadedType, setLoadedType] = useState<'demo' | 'schedule'>('demo');
  // const [loadingType, setLoadingType] = useState<'demo' | 'schedule' | null>(null);

  // useEffect(() => {
  //   const checkData = async () => {
  //     if (checkExistingData) {
  //       try {
  //         const hasData = await checkExistingData();
  //         setIsLoaded(hasData);
  //       } catch (error) {
  //         console.error("Error checking existing data:", error);
  //       }
  //     }
  //   };

  //   checkData();

  //   const handleDataChanged = () => {
  //     void checkData();
  //   };

  //   window.addEventListener('dataChanged', handleDataChanged);
  //   window.addEventListener('allDataCleared', handleDataChanged);

  //   return () => {
  //     window.removeEventListener('dataChanged', handleDataChanged);
  //     window.removeEventListener('allDataCleared', handleDataChanged);
  //   };
  // }, [checkExistingData]);

  // const loadDemoData = async () => {
  //   if (!onLoadDemoData) return;

  //   haptics.medium();
  //   setIsLoading(true);
  //   setLoadingType('demo');

  //   try {
  //     await onLoadDemoData();
  //     setIsLoaded(true);
  //     setLoadedType('demo');
  //     haptics.success();
  //     analytics.trackEvent('demo_data_loaded');
  //   } catch (error) {
  //     haptics.error();
  //     console.error("HomePage - Error loading demo data:", error);
  //     if (error instanceof Error) {
  //       console.error("Error details:", error.message, error.stack);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //     setLoadingType(null);
  //   }
  // };

  // const loadDemoScheduleOnly = async () => {
  //   if (!onLoadDemoScheduleOnly) return;

  //   haptics.medium();
  //   setIsLoading(true);
  //   setLoadingType('schedule');

  //   try {
  //     await onLoadDemoScheduleOnly();
  //     setIsLoaded(true);
  //     setLoadedType('schedule');
  //     haptics.success();
  //     analytics.trackEvent('demo_schedule_loaded');
  //   } catch (error) {
  //     haptics.error();
  //     console.error("HomePage - Error loading demo schedule:", error);
  //     if (error instanceof Error) {
  //       console.error("Error details:", error.message, error.stack);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //     setLoadingType(null);
  //   }
  // };

  // const clearData = async () => {
  //   if (!onClearData) return;

  //   haptics.medium();

  //   try {
  //     await onClearData();
  //     setIsLoaded(false);
  //     analytics.trackEvent('demo_data_cleared');
  //   } catch (error) {
  //     console.error("Error clearing data:", error);
  //     setIsLoaded(false);
  //     analytics.trackEvent('demo_data_cleared');
  //   }
  // };

  return (

    <main className="relative h-screen w-full">

      <div
        className={cn(
          "flex flex-col h-screen w-full justify-center items-center gap-6 2xl:pb-6",
          "bg-size-[40px_40px]",
          "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}  >

          <div className="text-4xl font-bold">{appName}</div>

        {/*Scout Role*/}
       





      </div>


      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black"></div>
    </main>

  );
};

export default HomePage;
