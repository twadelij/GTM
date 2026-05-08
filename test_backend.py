#!/usr/bin/env python3
"""
End-to-end test for GTM backend
Tests TMDB API, database, and challenge generation
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from backend import init_db, generate_weekly_challenge, get_weekly_challenge, save_weekly_challenge
import json

def test_tmdb_api():
    """Test TMDB API connection"""
    print("=" * 50)
    print("TEST 1: TMDB API Connection")
    print("=" * 50)
    
    movies = generate_weekly_challenge()
    
    if not movies:
        print("❌ FAILED: No movies generated from TMDB")
        return False
    
    print(f"✅ PASSED: Generated {len(movies)} movies from TMDB")
    
    # Validate movie structure
    for i, movie in enumerate(movies):
        print(f"\nMovie {i+1}:")
        print(f"  Title: {movie.get('title', 'MISSING')}")
        print(f"  Image: {movie.get('image', 'MISSING')}")
        print(f"  Options: {len(movie.get('options', []))} items")
        
        if 'title' not in movie:
            print(f"❌ FAILED: Movie {i+1} missing title")
            return False
        if 'image' not in movie:
            print(f"❌ FAILED: Movie {i+1} missing image")
            return False
        if 'options' not in movie or len(movie['options']) != 9:
            print(f"❌ FAILED: Movie {i+1} has wrong number of options")
            return False
    
    print("\n✅ PASSED: All movies have correct structure")
    return True

def test_database():
    """Test database operations"""
    print("\n" + "=" * 50)
    print("TEST 2: Database Operations")
    print("=" * 50)
    
    init_db()
    
    # Generate a test challenge
    movies = generate_weekly_challenge()
    if not movies:
        print("❌ FAILED: Could not generate test challenge")
        return False
    
    # Save to database
    try:
        save_weekly_challenge(movies)
        print("✅ PASSED: Saved challenge to database")
    except Exception as e:
        print(f"❌ FAILED: Could not save to database: {e}")
        return False
    
    # Retrieve from database
    try:
        retrieved = get_weekly_challenge()
        if not retrieved:
            print("❌ FAILED: Could not retrieve from database")
            return False
        
        if len(retrieved) != len(movies):
            print(f"❌ FAILED: Retrieved {len(retrieved)} movies, expected {len(movies)}")
            return False
        
        print(f"✅ PASSED: Retrieved {len(retrieved)} movies from database")
    except Exception as e:
        print(f"❌ FAILED: Could not retrieve from database: {e}")
        return False
    
    return True

def test_image_urls():
    """Test that image URLs are valid"""
    print("\n" + "=" * 50)
    print("TEST 3: Image URL Validation")
    print("=" * 50)
    
    movies = generate_weekly_challenge()
    if not movies:
        print("❌ FAILED: No movies to test")
        return False
    
    for i, movie in enumerate(movies):
        image_url = movie.get('image', '')
        if not image_url:
            print(f"❌ FAILED: Movie {i+1} has no image URL")
            return False
        
        if not image_url.startswith('https://image.tmdb.org/'):
            print(f"❌ FAILED: Movie {i+1} has invalid image URL: {image_url}")
            return False
    
    print(f"✅ PASSED: All {len(movies)} movies have valid TMDB image URLs")
    return True

def test_genre_matching():
    """Test that genre matching works"""
    print("\n" + "=" * 50)
    print("TEST 4: Genre Matching")
    print("=" * 50)
    
    movies = generate_weekly_challenge()
    if not movies:
        print("❌ FAILED: No movies to test")
        return False
    
    # Check that options include the correct answer
    for i, movie in enumerate(movies):
        title = movie.get('title', '')
        options = movie.get('options', [])
        
        if title not in options:
            print(f"❌ FAILED: Movie {i+1} correct answer not in options")
            return False
    
    print(f"✅ PASSED: All movies have correct answer in options")
    return True

def main():
    """Run all tests"""
    print("\n" + "=" * 50)
    print("GTM Backend End-to-End Tests")
    print("=" * 50 + "\n")
    
    tests = [
        test_tmdb_api,
        test_database,
        test_image_urls,
        test_genre_matching
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ EXCEPTION in {test.__name__}: {e}")
            import traceback
            traceback.print_exc()
            results.append(False)
    
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if all(results):
        print("✅ ALL TESTS PASSED")
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        return 1

if __name__ == '__main__':
    sys.exit(main())
