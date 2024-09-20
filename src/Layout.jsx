import React, { useState, useEffect, useRef, useCallback } from 'react';
import { makeStyles } from '@mui/styles';
import LayoutHeader from './LayoutHeader';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';

const useStyles = makeStyles({
  outer: {
    backgroundColor: '#171717',
    width: '99.98%',
    height: '100%',
  },
  content: {
    color: 'beige',
    padding: '20px',
    height: '100%',
    paddingTop: '84px',
  },
  image:{
    display:'block',
    objectFit:'cover'
  }
});


export default function Layout() {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state properly
  const [error, setError] = useState(null);
  const [filterData, setFilterData] = useState([]);
  const [page, setPage] = useState(1); // Track the current page
  const [hasMore, setHasMore] = useState(true); // To check if more pages are available
  const observer = useRef(); // IntersectionObserver ref

  // Load initial data
  useEffect(() => {
    setLoading(true);
    loadData(page).finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    if (page > 1) {
      loadData(page);
    }
  }, [page]);


  const DEFAULT_POSTER_IMAGE ='https://test.create.diagnal.com/images/placeholder_for_missing_posters.png'
  // Fetch data for a specific page
  const loadData = async (pageNumber) => {
    if (loading || !hasMore) return; // Prevent fetching if already loading or no more data

    setLoading(true); // Set loading before fetching new data
    try {
      const result = await dataFromAPI(pageNumber);
      if (result && result['content-items']) {
        setData((prevData) => [...prevData, ...result['content-items'].content]);
        setFilterData((prevData) => [...prevData, ...result['content-items'].content]);

        if (!result['content-items'].content.length) {
          setHasMore(false); // No more data to load
        }
      } else {
        setError('No content-items found');
        setHasMore(false);
      }
    } catch (err) {
      console.warn('No more pages to load:', err.message);
      setHasMore(false);
    } finally {
      setLoading(false); // Stop loading after data is fetched
    }
  };

  // Use Intersection Observer to detect when the user is near the bottom
  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1); // Trigger loading next page
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  ); 

  const searchTrigger = (e) => {
    const searchText = e.target.value.trim().toLowerCase();

    if (searchText) {
      const filtered = data.filter((item) => item.name.trim().toLowerCase().includes(searchText));
      setFilterData(filtered);
    } else {
      setFilterData(data); // Reset to original data
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={classes.outer}>
      <LayoutHeader searchTrigger={searchTrigger} />
      <div className={classes.content}>
        {/* {children} */}
        <div className="image-grid">
          {filterData.length > 0 ? (
            filterData.map((item, index) => {
              const posterImage = item['poster-image']
                ? `https://test.create.diagnal.com/images/${item['poster-image']}`
                : DEFAULT_POSTER_IMAGE; // Fallback image if poster is missing

              // Attach the ref to the last item to detect scroll
              if (index === filterData.length - 1) {
                return (
                  <ImageListItem key={item.img || index} ref={lastElementRef}>
                    <img
                    className='image'
                      src={posterImage}
                      alt={item.name}
                      loading="lazy"
                      width='20px'
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_POSTER_IMAGE;
                        
                      }}
                    />
                    <ImageListItemBar title={item.name} position="below" />
                  </ImageListItem>
                );
              } else {
                return (
                  <ImageListItem key={item.img || index}>
                    <img
                    className='image'
                      src={posterImage}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_POSTER_IMAGE; 
                      }}
                    />
                    <ImageListItemBar title={item.name} position="below" />
                  </ImageListItem>
                );
              }
            })
          ) : (
            <p>No results found</p>
          )}
        </div>
        {loading && <div>Loading more content...</div>} 
      </div>
    </div>
  );
}

async function dataFromAPI(pageNumber) {
  try {
    const response = await fetch(`https://test.create.diagnal.com/data/page${pageNumber}.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();
    return jsonData.page;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
