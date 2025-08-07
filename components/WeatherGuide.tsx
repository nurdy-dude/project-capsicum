import React, { useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';
import type { WeatherData } from '../utils/types';

export const WeatherGuide = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [aiTip, setAiTip] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAITip = useCallback(async (weatherData: WeatherData) => {
        setAiTip(null);
        try {
            const response = await api.getWeatherTip(weatherData);
            setAiTip(response.tip);
        } catch (err) {
            console.error("Error getting AI tip:", err);
            // Don't show AI error to user, just fail silently.
        }
    }, []);

    useEffect(() => {
        const fetchWeather = (lat: number, lon: number) => {
            // Using a free, no-key-required weather API for simplicity
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=ms&timezone=auto`)
                .then(response => response.json())
                .then(data => {
                    // This is a simplified weather code mapping
                    const conditionMap: { [key: number]: string } = {0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm'};
                    
                    const weatherData: WeatherData = {
                        city: data.timezone.split('/')[1]?.replace('_', ' ') || data.timezone, // Best guess for city name
                        temperature: data.current.temperature_2m,
                        condition: conditionMap[data.current.weather_code] || "Unknown",
                        humidity: data.current.relative_humidity_2m,
                        windSpeed: data.current.wind_speed_10m * 3.6, // m/s to km/h
                    };
                    setWeather(weatherData);
                    getAITip(weatherData);
                })
                .catch(err => {
                    console.error("Failed to fetch weather data:", err);
                    setError("Could not retrieve weather data. Please try again later.");
                })
                .finally(() => setLoading(false));
        };

        navigator.geolocation.getCurrentPosition(
            position => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            err => {
                console.error(err);
                setError("Location access denied. Please enable location services in your browser to use the weather guide.");
                setLoading(false);
            }
        );
    }, [getAITip]);
    
    return (
         <>
            <header>
                <h1><span className="chili-icon">☁️</span> Weather Guide</h1>
                <p>Your Local Grower's Forecast</p>
            </header>
            <div className="view-content">
                {loading && (
                    <div className="loader-container">
                        <div className="loader"></div>
                        <p>Checking your local forecast...</p>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
                {weather && (
                    <div className="weather-container">
                        <div className="weather-card">
                            <p className="weather-city">{weather.city}</p>
                            <p className="weather-temp">{Math.round(weather.temperature)}°C</p>
                            <p className="weather-condition">{weather.condition}</p>
                            <div className="weather-details">
                                <p><strong>Humidity:</strong> {weather.humidity}%</p>
                                <p><strong>Wind:</strong> {Math.round(weather.windSpeed)} km/h</p>
                            </div>
                        </div>

                        <div className="results-card ai-tip-card">
                            <h3>Today's Grower's Tip</h3>
                            {aiTip ? (
                                <p>{aiTip}</p>
                            ) : (
                                <div className="loader-container-small">
                                    <div className="loader-small"></div>
                                    <span>Generating tip...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
};