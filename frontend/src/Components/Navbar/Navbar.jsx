import { useContext } from 'react';
import { Link, useLocation } from 'react-router';
import { WebpageContext } from '../../context/WebpageContext';

export const Navbar = () => {
    const { isEmbedded } = useContext(WebpageContext);
    const location = useLocation();

    if (isEmbedded) return null;

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/':
                return 'Network Visualization';
            case '/map':
                return 'Network Map';
            case '/barchart':
                return 'Bar Chart Analysis';
            case '/piechart':
                return 'Pie Chart Analysis';
            default:
                return 'Network Visualization';
        }
    };

    return (
        <div className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="text-xl font-semibold">
                            {getPageTitle()}
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            to="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? 'bg-gray-900' : 'hover:bg-gray-700'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/map"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/map' ? 'bg-gray-900' : 'hover:bg-gray-700'
                                }`}
                        >
                            Map
                        </Link>
                        <Link
                            to="/barchart"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/barchart' ? 'bg-gray-900' : 'hover:bg-gray-700'
                                }`}
                        >
                            Bar Chart
                        </Link>
                        <Link
                            to="/piechart"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/piechart' ? 'bg-gray-900' : 'hover:bg-gray-700'
                                }`}
                        >
                            Pie Chart
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}; 