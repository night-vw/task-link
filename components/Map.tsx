"use client"
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import L from 'leaflet';
import { LatLngTuple, latLng } from 'leaflet';
import { FaSearch, FaTimes } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { BiCurrentLocation } from "react-icons/bi";
import { BsX } from "react-icons/bs";
import { IoIosList, IoMdPin } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { IoArrowForward } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import map_pinIcon from '@/public/map_pin-icon.png';
import workIcon from '@/public/work-icon.png';
import exerciseIcon from '@/public/exercise-icon.png';
import foodIcon from '@/public/food-icon.png';
import shoppingIcon from '@/public/shopping-icon.png';

const MapComponent = () => {
  const supabase = createClientComponentClient();
  const mapRef = useRef<L.Map | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null);
  const [searchMarker, setSearchMarker] = useState<L.Marker | null>(null);
  const [activeIcon, setActiveIcon] = useState('map_pinIcon');
  const [markerPlaced, setMarkerPlaced] = useState(false);
  const [markerUrl, setMarkerUrl] = useState('/map_pin-icon.png');
  const [formVisible, setFormVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [taskListVisible, setTaskListVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  let marker_add_check = false;
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [selectedOption, setSelectedOption] = useState('on');
  const [isDisabled, setIsDisabled] = useState(false);
  const [taskLength, setTaskLength] = useState(20);
  const [taskUpdate, setTaskUpdate] = useState(false);
  const [priority, setPriority] = useState('高');

  const tasks = Array.from({ length: 50 }, (_, index) => `タスク${index + 1}`);

  interface TaskData {
    taskName: string;
    taskDescription: string;
    deadlineBool: boolean;
    deadlineDate: string | null;
    priority: string;
    placeDescription: string;
    userId: string | null;
    latitude: number;
    longitude: number;
    markerUrl: string;
  }

  useEffect(() => {
    const now = new Date();
    const jstTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const year = jstTime.getFullYear();
    const month = String(jstTime.getMonth() + 1).padStart(2, '0');
    const day = String(jstTime.getDate()).padStart(2, '0');
    const hours = String(jstTime.getHours()).padStart(2, '0');
    const minutes = String(jstTime.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setCurrentDateTime(formattedDateTime);
    console.log(formattedDateTime)
  }, []);

  useEffect(() => {
    function handleResize() {
      const windowHeight = window.innerHeight;
      const windowWeight = window.innerWidth;
      let newItemsPerPage = 12;
      if (windowHeight < 700) {
        newItemsPerPage = 9;
      } else if (windowHeight < 900) {
        newItemsPerPage = 10;
      }

      let newTaskLength = 15;
      if (windowWeight < 400) {
        newTaskLength = 8;
      } else if (windowWeight < 500) {
        newTaskLength = 10;
      } else if (windowWeight < 1100) {
        newTaskLength = 12;
      }

      setTaskLength(newTaskLength);
      setItemsPerPage(newItemsPerPage);
    }
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();

    if (taskListVisible) {
      document.body.style.overflow = 'hidden'; // スクロールを無効にする
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
    } else {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventDefault, { passive: false });
      window.addEventListener('touchmove', preventDefault, { passive: false });
    }

    return () => {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
    };
  }, [taskListVisible]);


  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  useEffect(() => {
    if (mapRef.current === null) {
      mapRef.current = L.map('map', {
        zoomControl: false,
      }).setView([35.68078249, 139.767235], 16);

      L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
        attribution: '<a href="https://developers.google.com/maps/documentation?hl=ja">Google Map</a>',
      }).addTo(mapRef.current);

    }

    if (navigator.geolocation) {
      const success = (position: GeolocationPosition) => {
        let { latitude, longitude } = position.coords;
        const accuracy = position.coords.accuracy;

        console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`);

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);

          const currentLocationMarker = L.circleMarker([latitude, longitude], {
            color: '#FFFFFF',
            fillColor: '#0476D9',
            radius: 15,
            fillOpacity: 1,
            weight: 5
          }).addTo(mapRef.current)
        }

      };

      const error = () => {
        alert("Unable to retrieve your location.");
      };

      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];

      if (mapRef.current) {
        mapRef.current.flyTo([lat, lon], 16);
        const customIcon = L.icon({
          iconUrl: '/marker-icon.png',
          iconSize: [38, 38],
          iconAnchor: [22, 38],
          popupAnchor: [-3, -38],
        });
        const marker = L.marker([lat, lon], { icon: customIcon }).addTo(mapRef.current)
          .bindPopup(`${searchQuery}`)
          .openPopup();
        setSearchMarker(marker);
      }

    } else {
      alert("No results found.");
    }
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await response.json();
    setSuggestions(data);
  }, []);

  const handleSuggestionClick = (lat: number, lon: number, display_name: string) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 16);
      const customIcon = L.icon({
        iconUrl: '/marker-icon.png',
        iconSize: [38, 38],
        iconAnchor: [22, 38],
        popupAnchor: [-3, -38],
      });
      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(mapRef.current)
        .bindPopup(`${display_name}`)
        .openPopup();
      setSearchMarker(marker);
    }
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query) {
      debounceTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (searchMarker) {
      mapRef.current?.removeLayer(searchMarker);
      setSearchMarker(null);
    }
  };

  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            const currentLocation: LatLngTuple = [latitude, longitude];
            const mapBounds = mapRef.current.getBounds();
            const mapCenter = mapRef.current.getCenter();
            const mapCenterLatLng = latLng(mapCenter.lat, mapCenter.lng);

            const distance = mapCenterLatLng.distanceTo(latLng(latitude, longitude));
            const zoomLevel = mapRef.current.getZoom();

            const distanceThreshold = 500;

            if (mapBounds.contains(currentLocation) && distance < distanceThreshold) {
              mapRef.current.flyTo(currentLocation, zoomLevel);
            } else {
              mapRef.current.setView(currentLocation, 16);
            }
          }
        },
        () => {
          alert("Unable to retrieve your location.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const openForm = () => {
    setScrollPosition(window.scrollY); // フォーム表示前のスクロール位置を保存
    setFormVisible(true);
    document.body.style.overflow = 'hidden'; // スクロールを無効にする
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
  };

  const closeForm = () => {
    setFormVisible(false);
    setAddingMarker(false);
    marker_add_check = false;
    if (userMarker) {
      mapRef.current?.removeLayer(userMarker);
      setUserMarker(null);
    }
    document.body.style.overflow = 'auto'; // スクロールを再度有効にする
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition); // フォーム表示前のスクロール位置に戻る
    document.body.style.overflow = 'hidden'; // スクロールを再度有効にする
  };


  const toggleAddMarker = () => {
    setAddingMarker(!addingMarker);
    if (userMarker) {
      mapRef.current?.removeLayer(userMarker);
      setUserMarker(null);
      marker_add_check = false;
      setFormVisible(false);
    }
    setMarkerPlaced(false);
  };

  const toggleTaskList = () => {
    setTaskListVisible(!taskListVisible);
  };



  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (addingMarker && mapRef.current) {
      const customIcon = L.icon({
        iconUrl: markerUrl,
        iconSize: [60, 60],
        iconAnchor: [22, 38],
        popupAnchor: [-3, -38],
      });

      if (!marker_add_check) {
        const marker = L.marker(e.latlng, { icon: customIcon }).addTo(mapRef.current);
        setUserMarker(marker);
        marker_add_check = true;
        setMarkerPlaced(true);
        setScrollPosition(window.scrollY); // フォームが表示される前のスクロール位置を保存
        openForm(); // マーカー設置時にフォームを開く
      }
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on('click', handleMapClick);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, [addingMarker, markerUrl]);

  const map_pinIconClick = () => {
    setMarkerUrl('/map_pin-icon.png');
    setActiveIcon('map_pinIcon');
  }

  const workIconClick = () => {
    setMarkerUrl('/work-icon.png');
    setActiveIcon('workIcon');
  }

  const exerciseIconClick = () => {
    setMarkerUrl('/exercise-icon.png');
    setActiveIcon('exerciseIcon');
  }

  const foodIconClick = () => {
    setMarkerUrl('/food-icon.png');
    setActiveIcon('foodIcon');
  }

  const shoppingIconClick = () => {
    setMarkerUrl('/shopping-icon.png');
    setActiveIcon('shoppingIcon');
  }

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled === true) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
    setSelectedOption(e.target.value);
    console.log(isDisabled);
  };

  const handleBlur = () => {
    document.body.style.overflow = 'auto'; // スクロールを再度有効にする
    window.scrollTo(0, scrollPosition); // フォーム表示前のスクロール位置に戻る
    document.body.style.overflow = 'hidden'; // スクロールを無効にする
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const jumpTaskLocation = () => {
    setTaskListVisible(false);
    if (mapRef.current) {
      mapRef.current.flyTo([34.687257, 135.525855], 16);
      const customIcon = L.icon({
        iconUrl: '/marker-icon.png',
        iconSize: [38, 38],
        iconAnchor: [22, 38],
        popupAnchor: [-3, -38],
      });
      const marker = L.marker([34.687257, 135.525855], { icon: customIcon }).addTo(mapRef.current)
        .bindPopup(`タスク`)
        .openPopup();
      setSearchMarker(marker);
    }
  }

  const renderTasks = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tasks.slice(startIndex, endIndex).map((task, index) => (
      <li key={index} className="mb-2 p-2 border-b border-gray-200 flex items-center justify-start">
        <Image src={workIcon} alt="Task Marker" className="w-6 h-6 mr-2" />
        <button onClick={changeTaskUpdate} className="text-left">
          <span>{(task.length >= taskLength) ? `${task.slice(0, taskLength)}...` : task}</span>
        </button>
        <button style={{ color: '#243C74' }} className='absolute right-16' onClick={jumpTaskLocation}><IoMdPin /></button>
        <button style={{ color: '#FC644C' }} className='absolute right-5 '><MdDelete /></button>
      </li>
    ));
  };


  const handleTouchStart = () => {
    setTimeout(() => {
      document.body.style.overflow = 'hidden'; // スクロールを無効にする
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
    }, 0);
  };


  const changeTaskUpdate = () => {
    if (taskUpdate) {
      setTaskUpdate(false);
    } else {
      setTaskUpdate(true);
    }
  }

  const updateTask = () => {
    setTaskUpdate(false);
    const isMobile = window.innerWidth <= 768;

    toast(
      <div style={{ display: 'flex', alignItems: 'center' }}>
        タスクが変更されました
        <Image src={map_pinIcon} alt="Task Added" style={{ width: '24px', height: '24px', marginLeft: '10px' }} />
      </div>,
      {
        position: isMobile ? "top-center" : "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'text-base font-black',
      }
    );
  }

  const addTaskToSupabase = async (taskData: TaskData) => {
    const { taskName, taskDescription, deadlineBool, deadlineDate, priority, placeDescription, userId, latitude, longitude, markerUrl } = taskData;

    try {
      const { data, error } = await supabase
        .from('map_task')
        .insert([
          {
            task_name: taskName,
            task_description: taskDescription,
            deadline_bool: deadlineBool,
            deadline_date: deadlineBool ? deadlineDate : null,
            priority: priority,
            place_description: placeDescription,
            user_id: userId,
            latitude: latitude,
            longitude: longitude,
            category: markerUrl
          }
        ]);

      if (error) {
        throw error;
      }

      toast.success('タスクが追加されました', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'text-base font-black',
      });

      fetchTasks(); // タスク追加後にタスク一覧を再取得してマーカーを表示
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('タスクの追加に失敗しました', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'text-base font-black',
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const taskName = (e.target as any).elements.taskName.value;
    const taskDescription = (e.target as any).elements.taskDescription.value;
    const deadlineBool = selectedOption === 'on';
    const deadlineDate = deadlineBool ? (e.target as any).elements.deadlineDate.value : null;
    const priority = (e.target as any).elements.priority.value;
    const placeDescription = (e.target as any).elements.placeDescription.value;

    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data?.user?.id || null;

    const markerPosition = userMarker?.getLatLng();
    if (!markerPosition) {
      toast.error('マーカーの位置を設定してください。', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'text-base font-black',
      });
      return;
    }
    const { lat, lng } = markerPosition;

    const taskData: TaskData = {
      taskName,
      taskDescription,
      deadlineBool,
      deadlineDate,
      priority,
      placeDescription,
      userId,
      latitude: lat,
      longitude: lng,
      markerUrl
    };

    await addTaskToSupabase(taskData);
    closeForm();
  };

  const fetchTasks = async () => {
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data?.user?.id || null;
  
    const { data, error } = await supabase
      .from('map_task')
      .select('*')
      .eq('user_id', userId);
  
    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }
  
    if (mapRef.current !== null) {
      data.forEach(task => {
        const customIcon = L.icon({
          iconUrl: task.category,
          iconSize: [60, 60],
          iconAnchor: [22, 38],
          popupAnchor: [-3, -38],
        });
  
        const marker = L.marker([task.latitude, task.longitude], { icon: customIcon })
          .addTo(mapRef.current as L.Map)
          .bindPopup(`<b>${task.task_name}</b><br>${task.task_description}`);
      });
    }
  };
  
  

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" onTouchStart={handleTouchStart}>
      <form onSubmit={handleSearch} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-11/12 md:w-1/2">
        <div className="flex shadow-lg relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            ref={inputRef}
            className="text-lg w-full p-2 rounded-l-lg mr-0 border-2 text-gray-800 border-indigo-300 bg-white opacity-85"
            placeholder="マップ検索する"
            style={{ fontSize: '16px', willChange: 'auto' }} />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-10 top-2/4 transform -translate-y-2/4 p-1 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          )}
          <button
            type="submit"
            className="p-2 rounded-r-lg bg-indigo-500 text-white border-indigo-300 border-t border-b border-r opacity-90"
          >
            <FaSearch />
          </button>
        </div>
        {searchQuery && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 z-10 max-h-60 overflow-auto">
            {suggestions.map((suggestion: any, index: number) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSuggestionClick(suggestion.lat, suggestion.lon, suggestion.display_name)}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </form>
      <div id="map" className="w-full h-full z-10"></div>
      <button
        onClick={moveToCurrentLocation}
        className="absolute bottom-40 sm:bottom-20 left-1/2 transform -translate-x-1/2 p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none z-20"
      >
        <BiCurrentLocation size={40} />
      </button>
      <button
        onClick={toggleAddMarker}
        className="absolute xl:mr-60 bottom-40 sm:bottom-20 right-8 p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none z-20"
      >
        {addingMarker ? <BsX size={40} /> : <FiPlus size={40} />}
      </button>

      <button
        onClick={toggleTaskList}
        className="absolute xl:ml-60 bottom-40 sm:bottom-20 left-16 transform -translate-x-1/2 p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none z-20">
        <IoIosList size={40} />
      </button>

      {addingMarker && !markerPlaced && (
        <>
          <button
            onClick={shoppingIconClick}
            className={`absolute xl:mr-60 bottom-64 right-8 p-3 ${activeIcon === 'shoppingIcon' ? 'bg-rose-500' : 'bg-sky-500'} text-white rounded-full shadow-lg hover:bg-rose-600 focus:outline-none z-20`}
          >
            <Image src={shoppingIcon} alt="shopping Marker" className="w-10 h-10" />
          </button>
          <button
            onClick={foodIconClick}
            className={`absolute xl:mr-60 bottom-84 right-8 p-3 ${activeIcon === 'foodIcon' ? 'bg-rose-500' : 'bg-sky-500'} text-white rounded-full shadow-lg hover:bg-rose-600 focus:outline-none z-20`}
          >
            <Image src={foodIcon} alt="food Marker" className="w-10 h-10" />
          </button>
          <button
            onClick={exerciseIconClick}
            className={`absolute xl:mr-60 bottom-104 right-8 p-3 ${activeIcon === 'exerciseIcon' ? 'bg-rose-500' : 'bg-sky-500'} text-white rounded-full shadow-lg hover:bg-rose-600 focus:outline-none z-20`}
          >
            <Image src={exerciseIcon} alt="exercise Marker" className="w-10 h-10" />
          </button>
          <button
            onClick={workIconClick}
            className={`absolute xl:mr-60 bottom-124 right-8 p-3 ${activeIcon === 'workIcon' ? 'bg-rose-500' : 'bg-sky-500'} text-white rounded-full shadow-lg hover:bg-rose-600 focus:outline-none z-20`}
          >
            <Image src={workIcon} alt="work Marker" className="w-10 h-10" />
          </button>
          <button
            onClick={map_pinIconClick}
            className={`absolute xl:mr-60 bottom-144 right-8 p-3 ${activeIcon === 'map_pinIcon' ? 'bg-rose-500' : 'bg-sky-500'} text-white rounded-full shadow-lg hover:bg-rose-600 focus:outline-none z-20`}
          >
            <Image src={map_pinIcon} alt="map_pin Marker" className="w-10 h-10" />
          </button>
        </>
      )}
{formVisible && (
  <div className="absolute top-16 md:top-32 left-1/2 transform -translate-x-1/2 w-11/12 xl:w-1/3 md:w-2/3 p-4 bg-white bg-opacity-70 shadow-lg rounded-lg z-30">
    <button
      onClick={closeForm}
      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
      <FaTimes />
    </button>
    <form onSubmit={handleFormSubmit}>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-1">
          タスク名 (30文字)
          <span className='text-red-500 text-xs ml-4'>＊入力必須</span>
        </label>
        <input
          name="taskName"
          type="text"
          maxLength={30}
          required
          className="w-full p-1.5 border rounded-lg border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontSize: '16px' }}
        />
      </div>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-1">
          詳細/説明 (200文字)
        </label>
        <textarea
          name="taskDescription"
          maxLength={200}
          className="w-full p-1.5 border rounded-lg border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontSize: '16px' }}
          onBlur={handleBlur}
        />
      </div>
      <label className="block text-gray-700 text-sm mb-1 font-bold">
        期限あり / なし
      </label>
      <div className='flex mb-3'>
        <div className='mr-6'>
          <label className='text-sm font-bold'>
            <input
              type="radio"
              value="on"
              checked={selectedOption === 'on'}
              onChange={handleOptionChange}
            />
            あり
          </label>
        </div>
        <div>
          <label className='text-sm font-bold'>
            <input
              type="radio"
              value="off"
              checked={selectedOption === 'off'}
              onChange={handleOptionChange}
            />
            なし
          </label>
        </div>
      </div>
      {!isDisabled && (
        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-bold mb-1">
            期限
          </label>
          <input
            name="deadlineDate"
            type="datetime-local"
            value={currentDateTime}
            onChange={(e) => setCurrentDateTime(e.target.value)}
            className="p-1.5 w-full rounded-lg border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ fontSize: '16px' }}
            disabled={isDisabled}
          />
        </div>
      )}
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-1">
          優先度
        </label>
        <select
          name="priority"
          className="w-full p-1.5 border rounded-lg border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontSize: '16px' }}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-1">
          場所の詳細 (50文字)
        </label>
        <textarea
          name="placeDescription"
          maxLength={50}
          className="w-full p-1.5 border rounded-lg border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontSize: '16px' }}
          onBlur={handleBlur}
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full p-1.5 bg-indigo-500 text-white rounded-lg hover:opacity-90 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        タスクを追加
      </button>
    </form>
  </div>
)}


      <div
        id="task-list"
        className={`fixed inset-y-0 bg-white w-full md:w-1/2 xl:w-1/3 shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${taskListVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          onClick={toggleTaskList}
          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-800 focus:outline-none z-40"
        >
          <FaTimes size={24} />
        </button>
        {!taskUpdate ? (
          <div className="p-4">
            <div className='flex'>
              <h2 className="text-2xl font-bold mb-4">Taskリスト</h2>
              <div className='ml-6'>
                <Select>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="追加日" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_date">追加日</SelectItem>
                    <SelectItem value="high_priority">優先度 高</SelectItem>
                    <SelectItem value="near_deadline">期限 近</SelectItem>
                    <SelectItem value="near_deadline">期限切れ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ul>
              {renderTasks()}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={handlePrevPage}
                className="absolute left-4 bottom-6 p-2 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 focus:outline-none"
                disabled={currentPage === 0}
                style={{ display: currentPage === 0 ? 'none' : 'block' }}
              ><IoArrowBack size={40} />
              </button>
              <button
                onClick={handleNextPage}
                className="absolute bottom-6 p-2 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 focus:outline-none"
                disabled={(currentPage + 1) * itemsPerPage >= tasks.length}
                style={{ display: (currentPage + 1) * itemsPerPage >= tasks.length ? 'none' : 'block' }}
              ><IoArrowForward size={40} />
              </button>
            </div>
            <div className="absolute bottom-10 right-1/2 flex justify-center mt-4">
              <p className="text-lg font-bold text-gray-800">
                {currentPage + 1}/{Math.ceil(tasks.length / itemsPerPage)}
              </p>
            </div>
          </div>) :
          (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-11/12 xl:w-3/4 md:w-3/4 lg:w-2/3 p-4 bg-white bg-opacity-70 rounded-lg z-30">
              <div className='flex items-center justify-between'>
                <button onClick={changeTaskUpdate} className='mr-2 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 focus:outline-none'>
                  <IoArrowBack size={40} />
                </button>
                <div className='flex-grow text-center font-bold'>
                  タスク編集
                </div>
                <div className='w-10'></div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className='mt-10 md:mt-20'>
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-bold mb-1 md:text-lg">タスク名 (30文字)</label>
                  <input name="taskName" type="text" maxLength={30} required className="w-full p-1.5 border rounded-lg opacity-70 border-slate-700 text-sm" style={{ fontSize: '16px' }} />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-bold mb-1 md:text-lg">詳細/説明 (200文字)</label>
                  <textarea maxLength={200} className="w-full p-1.5 border rounded-lg opacity-70 border-slate-700 text-sm" style={{ fontSize: '16px' }} onBlur={handleBlur} />
                </div>
                <label className="block text-gray-700 text-sm font-bold mb-1 md:text-lg">期限あり / なし</label>
                <div className='flex mb-3'>
                  <div className='mr-6'>
                    <label className='text-sm font-bold md:text-lg'>
                      <input type="radio" value="on" checked={selectedOption === 'on'} onChange={handleOptionChange} />
                      あり
                    </label>
                  </div>
                  <div>
                    <label className='text-sm font-bold md:text-lg'>
                      <input type="radio" value="off" checked={selectedOption === 'off'} onChange={handleOptionChange} />
                      なし
                    </label>
                  </div>
                </div>
                {!isDisabled &&
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-1 md:text-lg">期限</label>
                    <input type="datetime-local" value={currentDateTime} className="p-1.5 w-full rounded-lg opacity-70 border-white-700 text-sm" style={{ fontSize: '16px' }} disabled={isDisabled} />
                  </div>
                }
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-bold mb-1 md:text-lg">優先度</label>
                  <select
                    className="w-full p-1.5 border rounded-lg opacity-70 border-slate-700 text-sm"
                    style={{ fontSize: '16px' }}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)} >
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-bold mb-1 md:text-lg">場所の詳細 (50文字)</label>
                  <textarea maxLength={50} className="w-full p-1.5 border rounded-lg opacity-70 border-slate-700 text-sm" style={{ fontSize: '16px' }} onBlur={handleBlur}></textarea>
                </div>
                <button onClick={updateTask} type="submit" className="w-full p-1.5 bg-indigo-500 text-white rounded-lg hover:opacity-90 text-sm md:text-lg">タスクを変更</button>
              </form>
            </div>

          )
        }
      </div>
      <div className="relative w-full h-screen overflow-hidden" onTouchStart={handleTouchStart}>
        <ToastContainer />
        <form onSubmit={handleSearch} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-11/12 md:w-1/2">
        </form>
      </div>
    </div>
  );
};

export default MapComponent;
