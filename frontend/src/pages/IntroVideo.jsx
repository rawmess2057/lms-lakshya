import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import IntroVideoPlayer from '../components/IntroVideoPlayer';

const IntroVideo = () => {
  const { type, id } = useParams();
  const [introVideo, setIntroVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntroVideo();
  }, [type, id]);

  const fetchIntroVideo = async () => {
    try {
      let response;
      if (type === 'global') {
        response = await axiosInstance.get('/intro-videos/global');
      } else if (type === 'preview' && id) {
        response = await axiosInstance.get(`/intro-videos/preview/${id}`);
      } else {
        toast.error('Invalid video type');
        setLoading(false);
        return;
      }

      if (response.data.data) {
        setIntroVideo(response.data.data);
      } else {
        // If no video found, create a default placeholder
        setIntroVideo({
          title: type === 'global' 
            ? 'Platform Introduction' 
            : 'Course Preview',
          description: type === 'global'
            ? 'Learn how to use Multan Academy. This video will guide you through all the features.'
            : 'Get a preview of this course content and teaching style.',
          videoUrl: null, // Will show placeholder in player
          bunnyVideoId: null,
        });
      }
    } catch (error) {
      toast.error('Failed to load intro video');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={type === 'preview' && id ? `/courses/${id}` : '/'}
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 inline-flex items-center font-medium transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        {type === 'preview' ? 'Back to Course' : 'Back to Home'}
      </Link>

      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            {introVideo?.title || (type === 'global' ? 'Platform Introduction' : 'Course Preview')}
          </h1>
          {introVideo?.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {introVideo.description}
            </p>
          )}
        </div>

        <IntroVideoPlayer
          videoUrl={introVideo?.videoUrl}
          bunnyVideoId={introVideo?.bunnyVideoId}
          title={introVideo?.title}
          description={introVideo?.description}
          showInfo={false}
          autoPlay={false}
        />

        {/* Additional Information Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Browse Courses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore our wide range of courses
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Enroll & Learn</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enroll in courses and start learning
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Get Certified</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Earn certificates upon completion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;

