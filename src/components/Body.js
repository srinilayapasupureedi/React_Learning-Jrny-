import { useState, useEffect, useContext } from 'react';
import { RestroCard, willPromotedLabel } from './RestroCard';
import Shimmer from './Shimmer';
import ResturantMenu from './ResturantMenu';
import { Link } from 'react-router-dom';
import useOnlineStatus from '../utils/useOnlineStatus';
import UserContext from '../utils/UserContext';
export const Body = () => {
  const [listOfRestaurants, setListOfRestaurants] = useState([]);
  const [filteredRestaurants, setfilteredResturants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const { loginedUser, setUserName } = useContext(UserContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&page_type=DESKTOP_WEB_LISTING'
      );
      const json = await response.json();
      // Dynamically find the card with the restaurant grid
      const restaurantGridCard = json?.data?.cards.find(
        (card) =>
          card?.card?.card?.gridElements?.infoWithStyle?.restaurants
      );
      const mainRestaurants =
        restaurantGridCard?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];
        console.log(mainRestaurants);

      setAllRestaurants(mainRestaurants);
      setListOfRestaurants(mainRestaurants);
      setfilteredResturants(mainRestaurants);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onlineStatus = useOnlineStatus();
  if (onlineStatus === false) {
    return <h1>Looks like you are offline! Check your connection please</h1>;
  }
  const ResturantCardPromoted = willPromotedLabel(RestroCard);

  // Use filteredRestaurants for shimmer and rendering
  return filteredRestaurants.length === 0 ? <Shimmer /> : (
    <div className='body-container'>
      <div className='flex p-4 m-4'>
        <input data-testid="search-input"
          className="border border-solid border-black rounded-b-[2px]"
          type="text"
          placeholder="Find Resturants"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <button data-testid='search-btn'
          className='bg-gray-400 px-4 rounded-b-[2px] text-white'
          onClick={() => {
            const filtered = allRestaurants.filter(
              restaurant => restaurant.info?.name.toLowerCase().includes(searchValue.toLowerCase())
            );
            setfilteredResturants(filtered);
          }}
        >Search</button>

        <button
          className='bg-gray-400 mx-[20px] p-2 text-white'
          onClick={() => {
            const filtered = allRestaurants.filter(
              restaurant => restaurant.info?.avgRating >= 4.5
            );
            setfilteredResturants(filtered);
          }}
        >
          Top rated Restaurants
        </button>
        <div>
          <label>UserName: </label>
          <input
            className='border border-black p-1'
            value={loginedUser}
            onChange={(e) => setUserName(e.target.value)}
          ></input>
        </div>
      </div>
      <div className='flex flex-wrap'>
        {filteredRestaurants.map((restaurant) => (
          <Link to={`/restaurants/${restaurant.info.id}`} key={restaurant.info.id}>
            {restaurant.info.promoted
              ? <ResturantCardPromoted resData={restaurant.info} />
              : <RestroCard resData={restaurant.info} />}
          </Link>
        ))}
      </div>
    </div>
  );
};