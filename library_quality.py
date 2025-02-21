#!/usr/bin/env python3

import os
import sqlite3
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class LibraryAnalyzer:
    def __init__(self, library_paths):
        self.library_paths = library_paths
        self.logger = logging.getLogger(__name__)
        
    def analyze_library(self, db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Get total number of books
            cursor.execute("SELECT COUNT(*) FROM books")
            total_books = cursor.fetchone()[0]
            self.logger.info(f"\nTotal books: {total_books}")
            
            # Check ISBN data
            cursor.execute("SELECT COUNT(*) FROM books WHERE isbn IS NULL OR isbn = ''")
            missing_isbn = cursor.fetchone()[0]
            self.logger.info(f"Books with missing ISBN: {missing_isbn}")
            
            # Check authors
            cursor.execute("""
                SELECT name, COUNT(*) 
                FROM authors 
                JOIN books_authors_link ON authors.id = books_authors_link.author 
                GROUP BY authors.id 
                ORDER BY COUNT(*) DESC 
                LIMIT 5
            """)
            authors = cursor.fetchall()
            if authors:
                self.logger.info("\nTop 5 authors by book count:")
                for author, count in authors:
                    self.logger.info(f"  {author}: {count}")
            
            # Find potential duplicates
            cursor.execute("""
                SELECT b.title, COUNT(*) as count
                FROM books b 
                GROUP BY b.title 
                HAVING count > 1 
                ORDER BY count DESC 
                LIMIT 5
            """)
            duplicates = cursor.fetchall()
            if duplicates:
                self.logger.info("\nPotential duplicates (same title):")
                for title, count in duplicates:
                    self.logger.info(f"\n  '{title}': {count} copies")
                    
                    # Get details of each copy
                    cursor.execute("""
                        SELECT b.path, a.name 
                        FROM books b 
                        JOIN books_authors_link bal ON b.id = bal.book 
                        JOIN authors a ON bal.author = a.id 
                        WHERE b.title = ?
                    """, (title,))
                    copies = cursor.fetchall()
                    for path, author in copies:
                        self.logger.info(f"   - {path} (by {author})")
            
            # Check series
            cursor.execute("""
                SELECT s.name, COUNT(*) 
                FROM series s 
                JOIN books_series_link ON series.id = books_series_link.series 
                GROUP BY series.id 
                ORDER BY COUNT(*) DESC 
                LIMIT 5
            """)
            series = cursor.fetchall()
            if series:
                self.logger.info("\nTop 5 series by book count:")
                for name, count in series:
                    self.logger.info(f"  {name}: {count}")
            
            conn.close()
            
        except sqlite3.Error as e:
            self.logger.error(f"Database error: {e}")
            self.logger.error("SQL error details:", exc_info=True)
        except Exception as e:
            self.logger.error(f"Error analyzing library: {e}")
            self.logger.error("Error details:", exc_info=True)

    def run_analysis(self):
        for library_path in self.library_paths:
            db_path = os.path.join(library_path, "metadata.db")
            if os.path.exists(db_path):
                self.logger.info(f"\n{'='*50}")
                self.logger.info(f"Analyzing library: {library_path}")
                self.logger.info(f"{'='*50}")
                self.analyze_library(db_path)
            else:
                self.logger.error(f"No metadata.db found in {library_path}")

if __name__ == "__main__":
    libraries = [
        "/ds/books/Engels",
        "/ds/books/Nederlands"
    ]
    
    analyzer = LibraryAnalyzer(libraries)
    analyzer.run_analysis() 