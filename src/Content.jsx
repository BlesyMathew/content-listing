import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Layout from './Layout';
import { useState,useEffect } from 'react';
import './Content.css'

async function dataFromAPI() {
  try {
    const response = await fetch('https://test.create.diagnal.com/data/page1.json');
    if (!response.ok) {
      console.log('error');
    }
    const jsonData = await response.json();
    return jsonData.page;
  } catch (err) {
    console.error(err);
  }
}

function Content() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    async function getData() {
      try {
        const result = await dataFromAPI();
        console.log('resuk',result)
        if (result && result['content-items']) {
          setData(result['content-items'].content);
        } else {
          setError('No content-items found');
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    getData();
  },[])
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    
    <Layout>
      
    {/* <div className="image-grid">
    {data?.map((item, index) => (
     
      <ImageListItem key={item.img}>
          <img
            src={`https://test.create.diagnal.com/images/${item['poster-image']}`}
            alt={item.name}
            loading="lazy"
          />
          <ImageListItemBar
            title={item.name}
            position="below"
          />
        </ImageListItem>
      ))}
    </div> */}
    </Layout>
  );
}

export default Content;
