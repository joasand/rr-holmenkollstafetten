Sys.setlocale("LC_ALL", "Norwegian_Norway.utf8")

#### SET UP ####

library(readxl)
library(purrr)
library(dplyr)
library(hms)
library(tidyr)
library(stringr)
library(lubridate)

sheet_vector <- readxl::excel_sheets("data/raw-data.xlsx")

#### DATA IMPORT ####

# Function to import and combine all sheets
import_and_combine_sheets <- function(file_path, sheet_names) {
  sheet_names |>
    purrr::map_dfr(function(sheet) {
      col_names <- names(readxl::read_excel(file_path, sheet = sheet, n_max = 0))
      col_types <- ifelse(col_names %in% c("klokkeslett", "etappetid"), "date", "text")
      readxl::read_excel(file_path, sheet = sheet, col_types = col_types) |>
        dplyr::mutate(
          source_sheet = sheet,
          klokkeslett = hms::as_hms(format(klokkeslett, "%H:%M:%S")),
          etappetid = hms::hms(
            seconds = as.numeric(format(etappetid, "%M")),
            minutes = as.numeric(format(etappetid, "%H")),
            hours = 0L
          )
        )
    })
}

# Import all sheets and combine them
combined_data <- import_and_combine_sheets("data/raw-data.xlsx", sheet_vector) |> 
  mutate(plassering_totalt = as.numeric(plassering_totalt),
         plassering_klasse = as.numeric(plassering_klasse),
         deltakere_totalt = as.numeric(deltakere_totalt),
         deltakere_klasse = as.numeric(deltakere_klasse))

#### WRANGLING ####

# Add custom variables
glimpse(combined_data)
combined_data <- combined_data |> 
  mutate(persentil_totalt = (plassering_totalt / deltakere_totalt)*100,
         persentil_klasse = (plassering_klasse / deltakere_klasse)*100,
         etappe_hastighet = str_remove_all(etappe_hastighet, " min/km"),
         etappe_hastighet = hms::hms(seconds = period_to_seconds(ms(etappe_hastighet))),
         etappe = factor(etappe, 
                         levels = c('St. Hanshaugen-1',
                                    'Norabakken-2',
                                    'Blåsen-3',
                                    'Berg og dal-4',
                                    'Forskningsparken-5',
                                    'Lille Besserud-6',
                                    'Besserud-7',
                                    'Utforetappen-8',
                                    'Gressbanen-9',
                                    'Den lange-10',
                                    'Frognerparken-11',
                                    'Dumpa-12',
                                    'Trappa-13',
                                    'Sjarmøren-14',
                                    'Bislett Stadion-15')))

#### EXPLORATORY ANALYSIS ####

data_long <- combined_data |> 
  mutate(etappe_hastighet = as.numeric(etappe_hastighet)/60) |> 
  select(-c(etappe_nr, etappe_deltaker, etappe_alternative,
            deltakere_totalt,
            deltakere_klasse,
            source_sheet,
            klokkeslett,
            etappetid,
            plassering_klasse,
            plassering_totalt)) |> 
  pivot_longer(-c(etappe, team, klasse, year),
               names_to = "metric_type")

glimpse(data_long)

library(ggplot2)
data_long |> 
  ggplot(aes(x = etappe,
             y = value,
             color = team)) +
  geom_point() +
  # facet_wrap(year~metric_type,
             # scales = "free",
  #            ncol = 5) +¨'
  facet_grid(year~metric_type,
             scales = "free") +
  coord_flip() #+
  # scale_color_viridis_c()

data_long |> 
  ggplot(aes(x = etappe,
             y = value)) +
  geom_boxplot(outliers = FALSE) +
  geom_jitter(width = 0.2) +
  # facet_wrap(year~metric_type,
             # scales = "free",
  #            ncol = 5) +¨'
  coord_flip() +
  facet_wrap(~metric_type, scales = "free")
  # scale_color_viridis_c()

data_long |> 
  filter(metric_type == "persentil_klasse") |> 
  ggplot(aes(x = year,
             y = value,
             group = team,
             color = team)) +
  geom_point() +
  geom_smooth(#method = "loess",
              se = FALSE,
              span = 5) +
  facet_wrap(~etappe)

#### EXAMPLE DATA FOR APP ####

glimpse(combined_data)

library(jsonlite)

combined_data |> 
  select(etappe_nr, 
         etappe,
         etappe_deltaker,
         etappetid,
         etappe_hastighet,
         year, 
         persentil_totalt, 
         persentil_klasse) |> 
  mutate(etappe = str_remove_all(etappe, "-"),
         etappe = str_remove_all(etappe, "\\d"),
         etappe = str_squish(etappe)
         ) |> 
  write_json("src/dev-data.json")


