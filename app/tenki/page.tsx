"use client";
import React, { useState, useEffect } from 'react';
import { MdSunny } from "react-icons/md";
import { MdCloud } from "react-icons/md";
import { IoRainy } from "react-icons/io5";

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecastWeather, setForecastWeather] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const weatherDescriptions: { [key: string]: string } = {
    "晴天": "晴れ",
    "雲": "曇り",
    "薄い雲": "曇り",
    "厚い雲": "曇り",
    "曇りがち": "曇り",
    "小雨": "雨",
    "適度な雨": "雨",
    "強い雨":"雨",
    "clear sky": "晴れ",
    "few clouds": "少し雲",
    "scattered clouds": "散在する雲",
    "broken clouds": "途切れた雲",
    "overcast clouds": "曇り",
    "shower rain": "にわか雨",
    "rain": "雨",
    "light rain": "小雨",
    "moderate rain": "雨",
    "heavy intensity rain": "大雨",
    "thunderstorm": "雷雨",
    "snow": "雪",
    "mist": "霧",
    "haze": "もや"
  };

  const weatherBackgrounds: { [key: string]: string } = {
    "晴れ": "/image/sunny.png",
    "曇り": "/image/kumori.png",
    "雨": "/image/ame.png",
    "雷雨": "/image/ame.png",
    "小雨": "/image/ame.png",
    "適度な雨": "/image/ame.png",
  };

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=ja`);
      const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=ja`);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('天気データの取得に失敗しました');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setCurrentWeather(currentData);
      setForecastWeather(forecastData.list.slice(0, 24)); // 3日間（8つの3時間ごとのデータ）
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocationAndFetchWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('このブラウザではGeolocationがサポートされていません。');
    }
  };

  useEffect(() => {
    getLocationAndFetchWeather();
  }, []);

  const backgroundImage = currentWeather ? weatherBackgrounds[weatherDescriptions[currentWeather.weather[0].description] || currentWeather.weather[0].description] : '/image/default.png';

  const renderWeatherIcon = (description: string) => {
    switch (description) {
      case "晴れ":
        return <MdSunny size={30} color="orange"/>;
      case "曇り":
        return <MdCloud size={30} color="gray" />;
      case "雨":
        return <IoRainy size={30} color="blue" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-cover bg-center`} style={{ backgroundImage: `url(${backgroundImage})` }}>
      {loading && (
        <div className="flex flex-col justify-center items-center h-screen text-2xl">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-zinc-600">天気情報を取得中...</p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {currentWeather && !loading && (
        <div className="text-center bg-white bg-opacity-80 p-4 rounded-lg shadow-md mb-4 w-3/4 mt-20 sm:w-1/2 lg:w-1/4 md:mt-2">
          <h2 className="text-2xl font-bold">{currentWeather.name}の現在の天気</h2>
          <p className='flex justify-center'>{renderWeatherIcon(weatherDescriptions[currentWeather.weather[0].description] || currentWeather.weather[0].description)}</p>
          <p>{weatherDescriptions[currentWeather.weather[0].description] || currentWeather.weather[0].description}</p>
          <p>{currentWeather.main.temp.toFixed(1)} °C</p>
          <p>湿度: {currentWeather.main.humidity}%</p>
          <p>風速: {currentWeather.wind.speed.toFixed(1)} m/s</p>
        </div>
      )}
      {forecastWeather.length > 0 && !loading && (
        <div className="text-center bg-white bg-opacity-80 p-4 rounded-lg shadow-md w-1/2 md:w-3/4">
          <h2 className="text-2xl font-bold mb-2">3日間の天気予報</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {forecastWeather.map((weather, index) => (
              <div key={index} className="p-1 bg-gray-100 rounded">
                <p>{new Date(weather.dt * 1000).toLocaleString('ja-JP', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                <p className='flex justify-center'>{renderWeatherIcon(weatherDescriptions[weather.weather[0].description] || weather.weather[0].description)}</p>
                <p>{weatherDescriptions[weather.weather[0].description] || weather.weather[0].description}</p>
                <p>{weather.main.temp.toFixed(1)} °C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
