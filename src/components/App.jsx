import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from './Searchbar';
import { ImageGallery } from './ImageGallery';
import { Button } from './Button';
import { Loader } from './Loader';
import { api } from 'service/api';
import { Modal } from './Modal';

export const App = () => {
  const [search, setSearch] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showingImage, setShowingImage] = useState(null);

  const escapeHandler = useCallback(
    evt => {
      if (evt.key === 'Escape') {
        setIsModalVisible(false);
      }
    },
    [setIsModalVisible]
  );

  useEffect(() => {
    document.addEventListener('keydown', escapeHandler);
    return () => {
      document.removeEventListener('keydown', escapeHandler);
    };
  }, [escapeHandler]);

  const setSearchValue = useCallback(
    evt => {
      setSearch(evt.target.value);
    },
    [setSearch]
  );

  const loadImages = useCallback(
    evt => {
      evt.preventDefault();
      setPage(1);
      setIsLoading(true);
    },
    [setIsLoading]
  );

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
    setIsLoading(true);
  }, [setPage, setIsLoading]);

  const openModal = useCallback(
    showImage => {
      setShowingImage(showImage);
      setIsModalVisible(true);
    },
    [setShowingImage, setIsModalVisible]
  );

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, [setIsModalVisible]);

  useEffect(() => {
    async function fetchData() {
      const response = await api.loadImages(search, page);

      setIsLoading(response.isLoading);
      setIsError(response.isError);

      if (page === 1) return setImages(response.images);

      setImages(
        images
          .concat(response.images)
          .sort()
          .filter((item, i, arr) => !i || item.id !== arr[i - 1].id)
      );
    }

    if (isLoading) {
      fetchData();
    }
  }, [isLoading, page, search, images, setIsLoading, setIsError, setImages]);

  return (
    <div className="App">
      <SearchBar
        value={search}
        onChange={setSearchValue}
        onSubmit={loadImages}
      />
      {images.length ? (
        <>
          <ImageGallery images={images} onOpen={openModal} />
          {!isLoading && <Button onClick={loadMore} />}
        </>
      ) : (
        ''
      )}
      {isError ? <p className="Error">Please, try later</p> : ''}
      {isLoading ? <Loader /> : ''}
      <Modal
        isModalVisible={isModalVisible}
        onClose={closeModal}
        image={showingImage}
      />
    </div>
  );
};
