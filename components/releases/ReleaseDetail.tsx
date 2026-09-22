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
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { ReleaseDetailSectionItem, ReleaseDetailView } from '@/types/release';
import { formatPrice } from '@/lib/formatUtils';
import { useLocale, useTranslations } from 'next-intl';

export function ReleaseDetail({
  release,
  loading,
  error,
}: {
  release: ReleaseDetailView | null;
  loading: boolean;
  error: string | null;
}) {
  const t = useTranslations('release');
  const locale = useLocale();

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
    return <Alert severity="info">{t('noDetails')}</Alert>;
  }

  const primaryImage = release.images[0];

  return (
    <Stack
      spacing={3}
      sx={{ minWidth: 0, pb: 4 }}
    >
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
        >
          <Box sx={{ flex: { xs: '0 0 auto', md: '0 0 280px' }, width: { xs: '100%', md: 280 } }}>
            {primaryImage ? (
              <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', bgcolor: 'grey.100' }}>
                <Image
                  src={primaryImage.uri}
                  alt={release.title}
                  fill
                  sizes="(max-width: 899px) 100vw, 280px"
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
                variant="subtitle1"
                component="p"
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
              {release.released && <Chip label={t('released', { date: release.released })} />}
              {release.dataQuality && <Chip label={t('quality', { value: release.dataQuality })} />}
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
                    {t('communityRating')}
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
                    {t('yourRating')}
                  </Typography>
                  <Rating
                    value={release.userRating}
                    max={5}
                    readOnly
                  />
                </Stack>
              )}
              <Metric
                label={t('have')}
                value={release.community.have}
              />
              <Metric
                label={t('want')}
                value={release.community.want}
              />
              <Metric
                label={t('forSale')}
                value={release.marketplace.numForSale}
              />
              <Metric
                label={t('lowestPrice')}
                value={formatPrice(release.marketplace.lowestPrice, locale)}
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

      <Section title={t('formats')}>
        <ChipList values={release.formats} empty={t('noValues')} />
      </Section>

      <Section title={t('genresStyles')}>
        <Stack spacing={1}>
          <ChipList
            values={release.genres}
            color="primary"
            empty={t('noValues')}
          />
          <ChipList values={release.styles} empty={t('noValues')} />
        </Stack>
      </Section>

      <Section title={t('labels')}>
        <ItemList
          items={release.labels}
          empty={t('noLabels')}
        />
      </Section>

      {release.companies.length > 0 && (
        <Section title={t('companies')}>
          <ItemList items={release.companies} empty={t('noValues')} />
        </Section>
      )}

      {release.extraArtists.length > 0 && (
        <Section title={t('credits')}>
          <ItemList items={release.extraArtists} empty={t('noValues')} />
        </Section>
      )}

      <Section title={t('tracklist')}>
        <TableContainer
          data-testid="tracklist-scroll-container"
          sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto', bgcolor: 'background.paper' }}
        >
          <Table sx={{ minWidth: 760 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('position')}</TableCell>
                <TableCell>{t('title')}</TableCell>
                <TableCell>{t('artists')}</TableCell>
                <TableCell>{t('credits')}</TableCell>
                <TableCell align="right">{t('duration')}</TableCell>
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
        </TableContainer>
      </Section>

      {release.identifiers.length > 0 && (
        <Section title={t('identifiers')}>
          <ItemList items={release.identifiers} empty={t('noValues')} />
        </Section>
      )}

      {release.notes && (
        <Section title={t('notes')}>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{release.notes}</Typography>
        </Section>
      )}

      {release.videos.length > 0 && (
        <Section title={t('videos')}>
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
    <Paper sx={{ minWidth: 0, overflow: 'hidden', p: { xs: 2, sm: 3 } }}>
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

function ChipList({ values, color, empty }: { values: string[]; color?: 'primary'; empty: string }) {
  if (values.length === 0) {
    return <Typography color="text.secondary">{empty}</Typography>;
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
