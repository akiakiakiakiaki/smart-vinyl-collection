'use client';

import Image from 'next/image';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import LinkMui from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { ReleaseDetailSectionItem, ReleaseDetailView } from '@/types/release';
import { formatPrice } from '@/lib/formatUtils';

export function ReleaseDetail({
  release,
  loading,
  error,
}: {
  release: ReleaseDetailView | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Stack sx={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!release) {
    return <Alert severity="info">No release details found.</Alert>;
  }

  const primaryImage = release.images[0];

  return (
    <Stack
      spacing={3}
      sx={{ pb: 4 }}
    >
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
        >
          <Box sx={{ flex: '0 0 280px' }}>
            {primaryImage ? (
              <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', bgcolor: 'grey.100' }}>
                <Image
                  src={primaryImage.uri}
                  alt={release.title}
                  fill
                  sizes="280px"
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>
            ) : (
              <Box sx={{ width: '100%', aspectRatio: '1 / 1', bgcolor: 'grey.100' }} />
            )}
          </Box>

          <Stack
            spacing={2}
            sx={{ flex: 1 }}
          >
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
              >
                Discogs Release #{release.id}
              </Typography>
              <Typography
                variant="h4"
                component="h1"
              >
                {release.title}
              </Typography>
              {release.artists && (
                <Typography
                  variant="h2"
                  color="text.secondary"
                >
                  {release.artists}
                </Typography>
              )}
            </Box>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: 'wrap' }}
            >
              {release.year && <Chip label={release.year} />}
              {release.country && <Chip label={release.country} />}
              {release.released && <Chip label={`Released ${release.released}`} />}
              {release.dataQuality && <Chip label={`Quality: ${release.dataQuality}`} />}
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              useFlexGap
              sx={{ flexWrap: 'wrap' }}
            >
              {release.community.ratingAverage != null && (
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Community rating
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Rating
                      value={release.community.ratingAverage}
                      precision={0.1}
                      readOnly
                    />
                    <Typography variant="body2">{release.community.ratingAverage.toFixed(2)}</Typography>
                    {release.community.ratingCount != null && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        ({release.community.ratingCount})
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              )}
              {release.userRating != null && (
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Your rating
                  </Typography>
                  <Rating
                    value={release.userRating}
                    max={5}
                    readOnly
                  />
                </Stack>
              )}
              <Metric
                label="Have"
                value={release.community.have}
              />
              <Metric
                label="Want"
                value={release.community.want}
              />
              <Metric
                label="For sale"
                value={release.marketplace.numForSale}
              />
              <Metric
                label="Lowest price"
                value={formatPrice(release.marketplace.lowestPrice)}
              />
            </Stack>

            {release.links.length > 0 && (
              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {release.links.map((link) => (
                  <LinkMui
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </LinkMui>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Section title="Formats">
        <ChipList values={release.formats} />
      </Section>

      <Section title="Genres & Styles">
        <Stack spacing={1}>
          <ChipList
            values={release.genres}
            color="primary"
          />
          <ChipList values={release.styles} />
        </Stack>
      </Section>

      <Section title="Labels">
        <ItemList
          items={release.labels}
          empty="No labels listed."
        />
      </Section>

      {release.companies.length > 0 && (
        <Section title="Companies">
          <ItemList items={release.companies} />
        </Section>
      )}

      {release.extraArtists.length > 0 && (
        <Section title="Credits">
          <ItemList items={release.extraArtists} />
        </Section>
      )}

      <Section title="Tracklist">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Artists</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell align="right">Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {release.tracklist.map((track, index) => (
              <TableRow key={`${track.position}-${track.title}-${index}`}>
                <TableCell>{track.position}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: track.type === 'heading' ? 700 : 400 }}>{track.title}</Typography>
                </TableCell>
                <TableCell>{track.artists}</TableCell>
                <TableCell>{track.extraArtists}</TableCell>
                <TableCell align="right">{track.duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {release.identifiers.length > 0 && (
        <Section title="Identifiers">
          <ItemList items={release.identifiers} />
        </Section>
      )}

      {release.notes && (
        <Section title="Notes">
          <Typography sx={{ whiteSpace: 'pre-line' }}>{release.notes}</Typography>
        </Section>
      )}

      {release.videos.length > 0 && (
        <Section title="Videos">
          <Stack
            divider={<Divider />}
            spacing={1}
          >
            {release.videos.map((video, index) => (
              <Box key={`${video.uri}-${video.title}-${index}`}>
                <LinkMui
                  href={video.uri}
                  target="_blank"
                  rel="noreferrer"
                >
                  {video.title}
                </LinkMui>
                {video.duration && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {video.duration}
                  </Typography>
                )}
                {video.description && <Typography variant="body2">{video.description}</Typography>}
              </Box>
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 2 }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function ChipList({ values, color }: { values: string[]; color?: 'primary' }) {
  if (values.length === 0) {
    return <Typography color="text.secondary">No values listed.</Typography>;
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ flexWrap: 'wrap' }}
    >
      {values.map((value) => (
        <Chip
          key={value}
          label={value}
          color={color}
          variant={color ? 'filled' : 'outlined'}
        />
      ))}
    </Stack>
  );
}

function ItemList({ items, empty = 'No values listed.' }: { items: ReleaseDetailSectionItem[]; empty?: string }) {
  if (items.length === 0) {
    return <Typography color="text.secondary">{empty}</Typography>;
  }

  return (
    <Stack
      divider={<Divider />}
      spacing={1}
    >
      {items.map((item, index) => (
        <Box key={`${item.primary}-${index}`}>
          <Typography>{item.primary}</Typography>
          {item.secondary && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {item.secondary}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: number | string | null }) {
  if (value == null || value === '') return null;

  return (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
