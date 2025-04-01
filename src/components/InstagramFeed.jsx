import React from 'react';
import { motion } from 'framer-motion';
import { FiInstagram } from 'react-icons/fi';

// In a real implementation, you'd fetch data from Instagram API
// For now, we'll use placeholder images
const instagramPosts = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    caption: "Fresh, local ingredients for today's special",
    likes: 45,
    url: 'https://instagram.com/p/example1'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c',
    caption: 'Morning yoga sessions in our peaceful studio',
    likes: 78,
    url: 'https://instagram.com/p/example2'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56',
    caption: 'Community gathering - farm to table dinner',
    likes: 120,
    url: 'https://instagram.com/p/example3'
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1484980972926-edee96e0960d',
    caption: 'New seasonal salad - packed with nutrients',
    likes: 65,
    url: 'https://instagram.com/p/example4'
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e',
    caption: 'Meditation workshop this weekend',
    likes: 92,
    url: 'https://instagram.com/p/example5'
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    caption: 'Locally-sourced, sustainable dining',
    likes: 83,
    url: 'https://instagram.com/p/example6'
  }
];

const InstagramFeed = ({ username = 'consciouscafe' }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Follow Our Journey</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Connect with us on Instagram for daily updates, behind-the-scenes moments, 
            and the conscious community we're building together.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {instagramPosts.map((post) => (
            <motion.a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-lg aspect-square"
              variants={item}
            >
              <img 
                src={`${post.imageUrl}?w=600&h=600&fit=crop&crop=faces&auto=format`} 
                alt={post.caption} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-white">
                <FiInstagram className="text-3xl mb-2" />
                <p className="text-sm text-center line-clamp-3">{post.caption}</p>
                <p className="mt-2 text-sm font-medium">{post.likes} likes</p>
              </div>
            </motion.a>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a 
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center btn btn-outline"
          >
            <FiInstagram className="mr-2" />
            Follow @{username}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramFeed;
