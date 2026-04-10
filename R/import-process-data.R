
library(readxl)
library(purrr)
library(dplyr)
library(hms)

sheet_vector <- readxl::excel_sheets("data/raw-data.xlsx")

# Function to import and combine all sheets
import_and_combine_sheets <- function(file_path, sheet_names) {
  sheet_names %>%
    purrr::map_dfr(function(sheet) {
      col_names <- names(readxl::read_excel(file_path, sheet = sheet, n_max = 0))
      col_types <- ifelse(col_names %in% c("klokkeslett", "etappetid"), "date", "text")
      readxl::read_excel(file_path, sheet = sheet, col_types = col_types) %>%
        dplyr::mutate(
          source_sheet = sheet,
          klokkeslett = hms::as_hms(format(klokkeslett, "%H:%M:%S")),
          etappetid = hms::as_hms(format(etappetid, "%H:%M:%S"))
        )
    })
}

# Import all sheets and combine them
combined_data <- import_and_combine_sheets("data/raw-data.xlsx", sheet_vector)
