import React from "react";
import { Helmet } from "react-helmet-async";
import { Event } from "../../types/events";

interface MetaTagsProps {
  event?: Event;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  event,
  title: customTitle,
  description: customDescription,
  image: customImage,
  url: customUrl,
}) => {
  const title = event ? `${event.name} - DropClip` : customTitle || "DropClip";
  const description = event
    ? `Join us for ${event.name} on ${event.date} at ${event.venue}!`
    : customDescription || "Discover and share amazing events with DropClip";
  const image =
    event?.flyerUrl ||
    event?.imageUrl ||
    customImage ||
    "/default-og-image.jpg";
  const url = event
    ? `${window.location.origin}/events/${event.id}`
    : customUrl || window.location.href;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="DropClip" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Event Meta Tags */}
      {event && (
        <>
          <meta property="og:type" content="event" />
          <meta property="event:start_time" content={event.date} />
          <meta property="event:location" content={event.venue} />
        </>
      )}
    </Helmet>
  );
};

export default MetaTags;
